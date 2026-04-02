'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { keepPreviousData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { useState } from 'react'
import ModalMediaBlock from './ModalMediaBlock'
import MediaGridSkeleton from './MediaGridSkeleton'
import { showToast } from '@/lib/showToast'
import ButtonLoading from '../ButtonLoading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const MediaModal = ({ open, setOpen, selectedMedia, setSelectedMedia, isMultiple }) => {

    const [previouslySelected, setPreviouslySelected] = useState([])
    const [activeTab, setActiveTab] = useState('library')
    const queryClient = useQueryClient()

    const fetchMedia = async (page) => {
        const { data: response } = await axios.get(`/api/media?page=${page}&&limit=18&&deleteType=SD`)
        return response
    }

    const { isPending, isError, error, data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['MediaModal'],
        queryFn: async ({ pageParam }) => await fetchMedia(pageParam),
        placeholderData: keepPreviousData,
        initialPageParam: 0,
        getNextPageParam: (lastPage, Pages) => {
            const nextPage = Pages.length
            return lastPage.hasMore ? nextPage : undefined
        }
    })


    const handleClear = () => {
        setSelectedMedia([])
        setPreviouslySelected([])
        showToast('success', 'Media selection cleared.')
    }
    const handleClose = () => {
        setSelectedMedia(previouslySelected)
        setOpen(false)
    }
    const handleSelect = (overriddenMedia = null) => {
        const mediaToSelect = overriddenMedia || selectedMedia;
        if (mediaToSelect.length <= 0) {
            return showToast('error', 'Please select a media.')
        }

        setPreviouslySelected(mediaToSelect)
        setOpen(false)
    }


    return (
        <Dialog
            open={open}
            onOpenChange={() => setOpen(!open)}
        >
            <DialogContent onInteractOutside={(e) => e.preventDefault()}
                className="sm:max-w-[80%] h-screen p-0 py-10 bg-transparent border-0 shadow-none"
            >
                <DialogDescription className="hidden"></DialogDescription>

                <div className='h-[90vh] bg-white dark:bg-card p-3 rounded shadow flex flex-col'>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                        <DialogHeader className="h-14 border-b flex-shrink-0">
                            <div className='flex justify-between items-center w-full'>
                                <DialogTitle>Media Selection</DialogTitle>
                                <TabsList className="grid w-[150px] grid-cols-1 h-9">
                                    <TabsTrigger value="library">Library</TabsTrigger>
                                </TabsList>
                            </div>
                        </DialogHeader>

                        <div className='flex-grow overflow-hidden'>
                            <TabsContent value="library" className="h-full overflow-auto py-2 m-0 mt-0 border-0 focus-visible:ring-0">
                                {isPending ?
                                    <MediaGridSkeleton />
                                    :
                                    isError ?
                                        <div className='size-full flex justify-center items-center'>
                                            <span className='text-red-500'>{error.message}</span>
                                        </div>
                                        :
                                        <>
                                            <div className='grid lg:grid-cols-6 grid-cols-3 gap-2'>
                                                {
                                                    data?.pages?.map((page, index) => (
                                                        <React.Fragment key={index}>
                                                            {
                                                                page?.mediaData?.mediaData?.map((media) => (
                                                                    <ModalMediaBlock
                                                                        key={media.id}
                                                                        media={media}
                                                                        selectedMedia={selectedMedia}
                                                                        setSelectedMedia={setSelectedMedia}
                                                                        isMultiple={isMultiple}
                                                                    />
                                                                ))
                                                            }
                                                        </React.Fragment>
                                                    ))
                                                }
                                            </div>

                                            {hasNextPage ?
                                                <div className='flex justify-center py-5'>
                                                    <ButtonLoading type="button" onClick={() => fetchNextPage()} loading={isFetching} text="Load More" />
                                                </div>
                                                :
                                                <p className='text-center py-5 text-sm text-gray-500'>Nothing more to load.</p>
                                            }

                                        </>
                                }
                            </TabsContent>
                        </div>
                    </Tabs>


                    <div className='h-14 pt-3 border-t flex justify-between items-center flex-shrink-0'>
                        <div>
                            <Button type="button" variant="destructive" onClick={handleClear} >
                                Clear All
                            </Button>
                        </div>
                        <div className='flex gap-5'>
                            <Button type="button" variant="secondary" onClick={handleClose} >
                                Close
                            </Button>
                            <Button type="button" onClick={() => handleSelect()} >
                                Select {selectedMedia.length > 0 && `(${selectedMedia.length})`}
                            </Button>
                        </div>
                    </div>

                </div>

            </DialogContent>
        </Dialog>
    )
}

export default MediaModal