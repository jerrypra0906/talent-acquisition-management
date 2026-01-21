import { useMemo, useState } from 'react'

type UploadResult = {
  created?: number
  failed?: number
  errors?: Array<{ row?: number; email?: string; message?: string }>
}

export default function BulkUploadModal({
  isOpen,
  title,
  templateName,
  onClose,
  onDownloadTemplate,
  onUpload,
  onUploaded,
}: {
  isOpen: boolean
  title: string
  templateName: string
  onClose: () => void
  onDownloadTemplate: (format: 'csv' | 'xlsx') => Promise<Blob>
  onUpload: (file: File) => Promise<any>
  onUploaded?: (result: UploadResult) => void
}) {
  const [format, setFormat] = useState<'csv' | 'xlsx'>('csv')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const errorPreview = useMemo(() => {
    const errs = result?.errors || []
    return errs.slice(0, 10)
  }, [result])

  if (!isOpen) return null

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleDownload = async () => {
    setBusy(true)
    setError(null)
    try {
      const blob = await onDownloadTemplate(format)
      downloadBlob(blob, `${templateName}.${format}`)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to download template')
    } finally {
      setBusy(false)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await onUpload(file)
      let parsed: any =
        res?.data || res?.data?.data || res?.data?.result || res?.data?.payload || res?.data || res?.data?.data
      // The backend response shape is { success, message, data: {created, failed, errors} }
      if (res?.success && res?.data) parsed = res.data

      setResult(parsed)
      if (onUploaded && parsed && typeof parsed === 'object') {
        onUploaded(parsed as UploadResult)
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => !busy && onClose()} />

        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">
                Download the template, fill it, then upload it back. Supported: CSV / XLSX.
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Template format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={busy}
              >
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="button"
                onClick={handleDownload}
                disabled={busy}
                className="inline-flex w-full justify-center rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
              >
                Download template
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Upload file</label>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={busy}
              className="mt-1 block w-full text-sm"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
              <div className="font-medium">Upload processed</div>
              <div className="mt-1">
                Created: <b>{result.created ?? 0}</b>, Failed: <b>{result.failed ?? 0}</b>
              </div>
              {(result.errors || []).length > 0 && (
                <div className="mt-2 text-green-900">
                  <div className="font-medium">First errors</div>
                  <ul className="mt-1 list-disc pl-5">
                    {errorPreview.map((e, idx) => (
                      <li key={idx}>
                        Row {e.row ?? '?'}: {e.email ? `${e.email} - ` : ''}
                        {e.message || 'Error'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto disabled:opacity-60"
            >
              Close
            </button>
            <button
              type="button"
              disabled={busy || !file}
              onClick={handleUpload}
              className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:w-auto disabled:opacity-60"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


