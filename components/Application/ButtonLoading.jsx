import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {cn} from "@/lib/utils"

const ButtonLoading = ({type,text,className,loading,onClick,...props})=>{
    return (
    <Button type={type} className={cn("",className)} disabled={loading} onClick={onClick} {...props}>
      {loading && <Loader2Icon className="animate-spin" />}
      {text}
    </Button>
    )
}

export default ButtonLoading