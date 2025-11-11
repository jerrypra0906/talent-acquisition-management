const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const prisma = require('../config/database');
const logger = require('../utils/logger');

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function sanitizeFileName(name) {
  const baseName = path.basename(name);
  return baseName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

async function ensureDirectory(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function removeFileIfExists(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn(`Failed to delete file ${filePath}: ${error.message}`);
    }
  }
}

async function moveUploadedFile(tempFile, destination) {
  await new Promise((resolve, reject) => {
    tempFile.mv(destination, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function uploadCandidateDocument(candidateId, file, options = {}) {
  if (!candidateId) {
    throw new Error('Candidate ID is required');
  }

  if (!file) {
    throw new Error('No file uploaded');
  }

  const { documentType = 'RESUME', baseUrl } = options;

  const normalizedType = String(documentType || 'RESUME').toUpperCase();

  const extension = path.extname(file.name || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error('Unsupported file extension');
  }

  const mimeType = file.mimetype;
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('Unsupported file type');
  }

  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const uploadsRoot = path.join(__dirname, '../../uploads');
  const candidateDirectory = path.join(uploadsRoot, 'candidates', candidateId);
  await ensureDirectory(candidateDirectory);

  const originalName = sanitizeFileName(file.name || 'document');
  const uniqueName = `${uuidv4()}${extension}`;
  const absolutePath = path.join(candidateDirectory, uniqueName);

  try {
    await moveUploadedFile(file, absolutePath);
  } catch (error) {
    logger.error(`Failed to store uploaded document for candidate ${candidateId}: ${error.message}`);
    throw new Error('Failed to save uploaded file');
  }

  const relativePath = path.posix.join('uploads', 'candidates', candidateId, uniqueName);
  const rawBase = (baseUrl || process.env.API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
  // Ensure the base URL does not include the API prefix so the static /uploads route works correctly
  const base = rawBase.replace(/\/api(?:\/)?$/i, '');
  const fileUrl = `${base}/${relativePath}`;

  const existingDocument = await prisma.document.findFirst({
    where: {
      candidateId,
      documentType: normalizedType,
    },
  });

  if (existingDocument) {
    const previousPath = path.join(candidateDirectory, existingDocument.fileName);
    await removeFileIfExists(previousPath);

    const updatedDocument = await prisma.document.update({
      where: { id: existingDocument.id },
      data: {
        fileName: uniqueName,
        originalName,
        fileSize: file.size,
        mimeType,
        fileUrl,
        uploadedAt: new Date(),
      },
    });

    logger.info(`Updated ${normalizedType} document for candidate ${candidateId}`);
    return updatedDocument;
  }

  const createdDocument = await prisma.document.create({
    data: {
      candidateId,
      documentType: normalizedType,
      fileName: uniqueName,
      originalName,
      fileSize: file.size,
      mimeType,
      fileUrl,
    },
  });

  logger.info(`Uploaded new ${normalizedType} document for candidate ${candidateId}`);
  return createdDocument;
}

async function getCandidateDocuments(candidateId) {
  if (!candidateId) {
    throw new Error('Candidate ID is required');
  }

  return prisma.document.findMany({
    where: { candidateId },
    orderBy: { uploadedAt: 'desc' },
  });
}

module.exports = {
  uploadCandidateDocument,
  getCandidateDocuments,
};
