'use client'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { CldUploadWidget } from 'next-cloudinary'
import { FiPlus } from 'react-icons/fi'

const UploadMedia = ({ isMultiple, queryClient, onUploadSuccess }) => {

  const handleError = (error) => {
    console.error("Cloudinary Widget Error:", error);
    const message = error?.statusText || error?.message || (typeof error === 'string' ? error : 'Failed to load Cloudinary Widget. Check your internet/DNS.');
    showToast('error', message);
  }

  const handleOnQueueEnd = async (results) => {
    const files = results.info.files
    const uploadedFiles = files.filter(file => file.uploadInfo).map(file => ({
      asset_id: file.uploadInfo.asset_id,
      public_id: file.uploadInfo.public_id,
      secure_url: file.uploadInfo.secure_url,
      path: file.uploadInfo.public_id, // Map path to public_id
      thumbnail: file.uploadInfo.thumbnail_url, // Use thumbnail_url for thumbnail
      thumbnail_url: file.uploadInfo.thumbnail_url,
    }))

    if (uploadedFiles.length > 0) {
      try {
        const { data: mediaUploadResponse } = await axios.post('/api/media/create', uploadedFiles)
        if (!mediaUploadResponse.success) {
          throw new Error(mediaUploadResponse.message)
        }

        queryClient.invalidateQueries(['media-data']);
        queryClient.invalidateQueries(['MediaModal']); // Also invalidate MediaModal query
        
        if (onUploadSuccess) {
          onUploadSuccess(mediaUploadResponse.data) // Use .data instead of .mediaData
        }
        
        showToast('success', mediaUploadResponse.message)
      } catch (error) {
        showToast('error', error.message)
      }
    }
  }


  return (
    <CldUploadWidget
      signatureEndpoint="/api/cloudinary-signature"
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPDATE_PRESET}
      onError={handleError}
      onQueuesEnd={handleOnQueueEnd}
      config={
        {
          cloud: {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
          }
        }
      }

      options={
        {
          multiple: isMultiple,
          sources: ['local', 'url', 'unsplash', 'google_drive']
        }
      }
    >
      {({ open }) => {
        return (
          <Button onClick={() => open()}>
            <FiPlus />
            Upload Media
          </Button>
        );
      }}
    </CldUploadWidget>
  )
}

export default UploadMedia
