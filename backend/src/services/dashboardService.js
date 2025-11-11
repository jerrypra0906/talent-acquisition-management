const prisma = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
  try {
    // Get counts from database
    const [
      totalCandidates,
      totalFPTKs,
      activeFPTKs,
      publishedFPTKs,
      totalApplications,
      activeApplications,
      pendingInterviews,
      pendingOffers,
      hiredThisMonth,
    ] = await Promise.all([
      prisma.candidate.count(),
      prisma.fPTK.count(),
      prisma.fPTK.count({ where: { isPublished: true } }),
      prisma.fPTK.count({ where: { isPublished: true, status: { notIn: ['FILLED', 'CANCELLED'] } } }),
      prisma.application.count(),
      prisma.application.count({
        where: {
          status: {
            in: ['SUBMITTED', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED'],
          },
        },
      }),
      prisma.interview.count({
        where: {
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
          scheduledAt: {
            gte: new Date(),
          },
        },
      }),
      prisma.offer.count({
        where: {
          status: {
            in: ['PENDING_HRBP_REVIEW', 'PENDING_HEAD_APPROVAL', 'SENT_TO_CANDIDATE'],
          },
        },
      }),
      prisma.application.count({
        where: {
          status: 'HIRED',
          hiredAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Calculate interviews this week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() - dayOfWeek + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const interviewsThisWeek = await prisma.interview.count({
      where: {
        scheduledAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
    });

    // Fetch all FPTKs for dashboard charts
    const allFPTKs = await prisma.fPTK.findMany({
      select: {
        id: true,
        areaDetail: true,
        area: true,
        requestDate: true,
        status: true,
        currentStatus: true,
      },
    });

    logger.info(`Dashboard: Fetched ${allFPTKs.length} FPTKs for charts`);

    // Helper function to get location (areaDetail or area or 'Unknown')
    const getLocation = (fptk) => {
      return fptk.areaDetail || fptk.area || 'Unknown';
    };

    // Helper function to get status for display (currentStatus or status or default)
    const getStatus = (fptk) => {
      // Use currentStatus if available, otherwise use status enum value, otherwise default
      if (fptk.currentStatus) {
        return fptk.currentStatus;
      }
      // Map FPTKStatus enum to display string
      const statusMap = {
        'DRAFT': 'Draft',
        'APPROVED': 'Approved',
        'OPEN': 'Open',
        'PARTIALLY_FILLED': 'Partially Filled',
        'FILLED': 'Filled',
        'CANCELLED': 'Cancelled',
        'EXPIRED': 'Expired',
      };
      return statusMap[fptk.status] || fptk.status || 'Raise FPTK';
    };

    // Helper function to check if status is closed
    const isClosed = (fptk) => {
      const status = getStatus(fptk);
      const dbStatus = fptk.status;
      // Closed if status contains 'On Boarding', 'Cancelled', 'Filled', or database status is FILLED or CANCELLED
      const statusLower = status.toLowerCase();
      return (
        statusLower.includes('on boarding') ||
        statusLower.includes('boarding') ||
        statusLower === 'cancelled' ||
        statusLower === 'filled' ||
        dbStatus === 'FILLED' ||
        dbStatus === 'CANCELLED'
      );
    };

    // Calculate Position Status by Location
    const positionStatusByLocationMap = {};
    allFPTKs.forEach((fptk) => {
      const location = getLocation(fptk);
      if (!positionStatusByLocationMap[location]) {
        positionStatusByLocationMap[location] = {
          location,
          total: 0,
          closed: 0,
          open: 0,
        };
      }
      positionStatusByLocationMap[location].total += 1;
      if (isClosed(fptk)) {
        positionStatusByLocationMap[location].closed += 1;
      } else {
        positionStatusByLocationMap[location].open += 1;
      }
    });
    const positionStatusByLocation = Object.values(positionStatusByLocationMap);

    // Calculate Open Position Progress by Area Detail
    const openPositionProgressMap = {};
    allFPTKs.forEach((fptk) => {
      const areaDetail = getLocation(fptk);
      const status = getStatus(fptk);
      
      if (!openPositionProgressMap[areaDetail]) {
        openPositionProgressMap[areaDetail] = {
          areaDetail,
          statusCounts: {},
          total: 0,
        };
      }
      
      if (!openPositionProgressMap[areaDetail].statusCounts[status]) {
        openPositionProgressMap[areaDetail].statusCounts[status] = 0;
      }
      
      openPositionProgressMap[areaDetail].statusCounts[status] += 1;
      openPositionProgressMap[areaDetail].total += 1;
    });

    // Calculate percentages for each area detail
    const totalOpenPositions = allFPTKs.length;
    Object.values(openPositionProgressMap).forEach((areaData) => {
      areaData.percentage = totalOpenPositions > 0 
        ? Math.round((areaData.total / totalOpenPositions) * 100) 
        : 0;
    });
    const openPositionProgress = Object.values(openPositionProgressMap);

    // Calculate SLA by Location (from Request Date)
    const nowDate = new Date();
    const slaByLocationMap = {};
    allFPTKs.forEach((fptk) => {
      const areaDetail = getLocation(fptk);
      const requestDate = fptk.requestDate;
      
      if (!slaByLocationMap[areaDetail]) {
        slaByLocationMap[areaDetail] = {
          areaDetail,
          buckets: {
            '0-30 Days': 0,
            '31-60 Days': 0,
            '61-90 Days': 0,
            'Above 91 Days': 0,
          },
          total: 0,
        };
      }
      
      if (requestDate && !isNaN(new Date(requestDate).getTime())) {
        const requestDateObj = new Date(requestDate);
        const diffDays = Math.floor(
          (nowDate.getTime() - requestDateObj.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (diffDays <= 30) {
          slaByLocationMap[areaDetail].buckets['0-30 Days'] += 1;
        } else if (diffDays <= 60) {
          slaByLocationMap[areaDetail].buckets['31-60 Days'] += 1;
        } else if (diffDays <= 90) {
          slaByLocationMap[areaDetail].buckets['61-90 Days'] += 1;
        } else {
          slaByLocationMap[areaDetail].buckets['Above 91 Days'] += 1;
        }
        
        slaByLocationMap[areaDetail].total += 1;
      }
    });
    const slaByLocation = Object.values(slaByLocationMap);

    // Generate recent activity from candidates and FPTKs
    const recentCandidates = await prisma.candidate.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const recentFPTKs = await prisma.fPTK.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        positionTitle: true,
        position: true,
        createdAt: true,
      },
    });

    const recentActivity = [
      ...recentCandidates.map((candidate) => ({
        type: 'candidate_added',
        message: `New candidate ${candidate.user.firstName} ${candidate.user.lastName} added`,
        timestamp: candidate.createdAt.toISOString(),
        icon: 'user',
      })),
      ...recentFPTKs.map((fptk) => ({
        type: 'job_posting_created',
        message: `New position "${fptk.positionTitle || fptk.position}" created`,
        timestamp: fptk.createdAt.toISOString(),
        icon: 'briefcase',
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    logger.info(`Dashboard: Calculated metrics - PositionStatusByLocation: ${positionStatusByLocation.length}, OpenPositionProgress: ${openPositionProgress.length}, SLAByLocation: ${slaByLocation.length}, RecentActivity: ${recentActivity.length}`);

    const result = {
      totalCandidates,
      totalFPTKs,
      activeFPTKs,
      openPositions: publishedFPTKs,
      totalApplications,
      activeApplications,
      pendingInterviews,
      interviewsThisWeek,
      pendingOffers,
      hiredThisMonth,
      positionStatusByLocation,
      openPositionProgress,
      slaByLocation,
      recentActivity,
    };

    // Log sample data for debugging
    if (positionStatusByLocation.length > 0) {
      logger.info(`Dashboard: Sample positionStatusByLocation:`, JSON.stringify(positionStatusByLocation[0]));
    }
    if (openPositionProgress.length > 0) {
      logger.info(`Dashboard: Sample openPositionProgress:`, JSON.stringify(openPositionProgress[0]));
    }
    if (slaByLocation.length > 0) {
      logger.info(`Dashboard: Sample slaByLocation:`, JSON.stringify(slaByLocation[0]));
    }

    return result;
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

module.exports = {
  getDashboardStats,
};

