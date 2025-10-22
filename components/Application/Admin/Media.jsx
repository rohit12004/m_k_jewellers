
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ADMIN_MEDIA_EDIT } from "@/routes/adminPanelRoutes"
import Image from "next/image"
import Link from "next/link"
import { BsThreeDotsVertical } from 'react-icons/bs'
import { MdOutlineEdit } from 'react-icons/md'
import { IoIosLink } from "react-icons/io"
import { LuTrash } from "react-icons/lu"
import { showToast } from "@/lib/showToast"

const Media = ({
  media,
  handleDelete,
  deleteType,
  selectedMedia,
  setSelectedMedia,
}) => {
  const handleCheck = () => {
    let newSelectedMedia =[];

    if (selectedMedia.includes(media.id)) {
      newSelectedMedia = selectedMedia.filter(m => m !== media.id);
    } else {
      newSelectedMedia = [...selectedMedia, media.id];
    }

    setSelectedMedia(newSelectedMedia);

  }

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    showToast('success', 'Link copied to clipboard');
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 relative group rounded overflow-hidden">
      <div className="absolute top-2 left-2 z-20">
        <Checkbox
          checked={selectedMedia.includes(media.id)}
          onCheckedChange={handleCheck}
          className="border-primary cursor-pointer"
        />
      </div>
      <div className="absolute top-2 right-2 z-20">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-black/50 cursor-pointer">
              <BsThreeDotsVertical color='white' />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start'>
            {deleteType === 'SD' &&
              <>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={ADMIN_MEDIA_EDIT(media.id)}>
                    <MdOutlineEdit />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleCopyLink(media.secure_url)}>
                  <IoIosLink />
                  Copy Link
                </DropdownMenuItem>
              </>
            }
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleDelete([media.id], deleteType)}>
              <LuTrash color="red" />
              {deleteType === 'SD' ? 'Move into Trash' : 'Delete Permanently'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        className="w-full h-full absolute z-10 transition-all duration-150 ease-in group-hover:bg-black/30"
      ></div>

      <div>
        <Image
          src={media?.secure_url}
          alt={media?.alt || 'Image'}
          height={300}
          width={300}
          className="object-cover w-full sm:h-[200px] h-[150px]"
        />
      </div>
    </div>
  )
}

export default Media
