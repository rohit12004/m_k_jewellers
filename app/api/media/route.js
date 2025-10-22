import { catchError, isAuthenticated, response } from "@/lib/helperFunction";
import { getMedia } from "@/lib/mediaUpload.service";
import { NextResponse } from "next/server";

export async function GET(request){
    try {
        // const auth = await isAuthenticated('admin');
        // if (!auth.isAuth) {
        //     return response(false, 403, 'Unauthorized access');
        // }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page'),10) || 0;
        const limit = parseInt(searchParams.get('limit'),10) || 10;
        const deleteType = searchParams.get('deleteType');
        // SD => soft delete, RSD=> restore soft deleted, PD => permanent delete
        let filter={};
        if(deleteType ==='SD'){
            filter = {deletedAt : null}   
        }else if(deleteType === 'PD'){
            filter = { NOT: { deletedAt: null } };
        }

        const mediaData = await getMedia(filter, page, limit);

        return NextResponse.json({
            mediaData : mediaData,
            hasMore : (page + 1) < mediaData.pagination.totalPages
        })

    } catch (error) {
        return catchError(error);
    }
}