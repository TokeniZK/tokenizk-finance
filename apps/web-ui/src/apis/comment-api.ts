import { $httpInstance } from "@/utils"
import type { BaseResponse, CommentDto} from "@tokenizk/types";

// submit Comment
export async function submitComment(commentDto: CommentDto) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.post<BaseResponse<number>>('/submit-comments', commentDto).then(r => {
            return r.data
        });
        if (rs.code == 0) {
            return rs.data!;
        }
        return -1;

    } catch (error) {
        console.error(error);
    }
    return -1;
}

// query Comment By Project Addr
export async function queryCommentByProjectAddr(address: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.get<BaseResponse<CommentDto[]>>(`/query-comments-by-address?address=${address}`).then(r => {
            return r.data.data
        });

        return rs ?? [];
    } catch (error) {
        console.error(error);
    }
    return [];
}


// query Comment By user Addr
export async function queryCommentByUserAddr(address: string) {
    try {
        // request sequencer for the result.
        const rs = await $httpInstance.get<BaseResponse<CommentDto[]>>(`/query-new-comments-by-user-address?address=${address}`).then(r => {
            return r.data.data
        });

        return rs ?? [];
    } catch (error) {
        console.error(error);
    }
    return [];
}
