"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUpload: (files: File[]) => void;
  onUploadSuccess?: () => void;
  sessionId?: string;
}

export function UploadDialog({ 
  open, 
  onOpenChange, 
  onFileUpload,
  onUploadSuccess,
  sessionId
}: UploadDialogProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      const pdfFiles = newFiles.filter(file => file.type === 'application/pdf')
      
      if (pdfFiles.length < newFiles.length) {
        toast.warning("Some files were skipped", {
          description: "Only PDF files are supported."
        })
      }
      
      setFiles(prev => [...prev, ...pdfFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    
    setIsUploading(true)
    const formData = new FormData()
    
    // Add files to form data
    files.forEach((file) => {
      formData.append("files", file)
    })

    const toastId = toast.loading(`Uploading ${files.length} file(s)...`)

    try {
      // Call our API endpoint instead of directly calling the Python backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // Headers are automatically set by the browser for FormData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || "Failed to upload files. Please try again."
        )
      }

      // Handle successful upload
      setFiles([])
      if (inputRef.current) {
        inputRef.current.value = ""
      }

      toast.success("Upload successful", {
        description: `${result.files?.length || files.length} file(s) have been uploaded and processed.`,
        id: toastId,
      })

      // Call the success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess()
      }

      // Close the dialog and pass all files to parent
      onOpenChange(false)
      onFileUpload(files);
  
    } catch (error) {
      console.error("Error uploading files:", error)
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "An error occurred during upload.",
        id: toastId,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload PDFs</DialogTitle>
          <DialogDescription>
            Upload your PDF files here. Click upload when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file-upload">Files</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="file-upload" 
                type="file" 
                multiple 
                onChange={handleFileChange}
                ref={inputRef}
                accept=".pdf"
                className="cursor-pointer"
                disabled={isUploading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Max file size: 15MB. Only PDF files are supported.
            </p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected files ({files.length}):</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} {files.length === 1 ? 'file' : 'files'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}