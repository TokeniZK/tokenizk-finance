<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useStatusStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { omitAddress } from "@/utils"
import { type CommentDto } from '@tokenizk/types'
import { queryCommentByProjectAddr, submitComment } from '@/apis/comment-api'
import { UserFilled } from '@element-plus/icons-vue'

type CommentDtoExtend = CommentDto & { children: CommentDto[] }

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();


// let commentDatalist = [
//   {
//     status: "成功",
//     code: 200,
//     data: [
//       {
//         id: 'comment0001', //主键id
//         date: '2018-07-05 08:30',  //评论时间
//         ownerId: 'talents100020', //文章的id
//         fromId: 'errhefe232213',  //评论者id
//         fromName: 'Tang评论家',   //评论者昵称
//         fromAvatar: 'http://ww4.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2pddjuj30v90uvagf.jpg', //评论者头像
//         likeNum: 3, //点赞人数
//         content: '非常靠谱的程序员',  //评论内容
//         reply: [  //回复，或子评论
//           {
//             id: '34523244545',  //主键id
//             commentId: 'comment0001',  //父评论id，即父亲的id
//             fromId: 'observer223432',  //评论者id
//             fromName: 'cherry',  //评论者昵称
//             fromAvatar: 'https://wx4.sinaimg.cn/mw690/69e273f8gy1ft1541dmb7j215o0qv7wh.jpg', //评论者头像
//             toId: 'errhefe232213',  //被评论者id
//             toName: 'Tang评论家',  //被评论者昵称
//             toAvatar: 'http://ww4.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2pddjuj30v90uvagf.jpg',  //被评论者头像
//             content: '赞同，很靠谱，水平很高',  //评论内容
//             date: '2018-07-05 08:35'   //评论时间
//           },
//           {
//             id: '34523244545',
//             commentId: 'comment0001',
//             fromId: 'observer567422',
//             fromName: '清晨一缕阳光',
//             fromAvatar: 'http://imgsrc.baidu.com/imgad/pic/item/c2fdfc039245d688fcba1b80aec27d1ed21b245d.jpg',
//             toId: 'observer223432',
//             toName: 'cherry',
//             toAvatar: 'https://wx4.sinaimg.cn/mw690/69e273f8gy1ft1541dmb7j215o0qv7wh.jpg',
//             content: '大神一个！',
//             date: '2018-07-05 08:50'
//           }
//         ]
//       },
//       {
//         id: 'comment0002',
//         date: '2018-07-05 08:30',
//         ownerId: 'talents100020',
//         fromId: 'errhefe232213',
//         fromName: '毒蛇郭德纲',
//         fromAvatar: 'http://ww1.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2q2p8pj30v90uzmzz.jpg',
//         likeNum: 0,
//         content: '从没见过这么优秀的人',
//         reply: []
//       }
//     ]
//   }
// ];

// let commentProjects = reactive({ commenList: commentDatalist });

const props = defineProps<{
    address: string;
    projectType: number;
}>()

const commentData = await queryCommentByProjectAddr(props.address)
console.log('commentData:', commentData);

// transform data into tree-pattern
const renderComments = commentData.filter(c1 => {
    return c1.parentCommentId == -1
}) as CommentDtoExtend[];
renderComments.forEach(c => {
    c.children = commentData.filter(c2 => c2.parentCommentId == c.id)
});
console.log('renderComments:', renderComments);

let commentDatalist = reactive({ commentlist: renderComments });

const inputComment = ref('');
const inputComment2 = ref('');
const showItemId = ref(-1);

const addComment = async () => {
    if (!appState.connectedWallet58) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect your wallet first, and then you can leave a comment .`,
        });

        return;
    }

    // trigger signature
    // sha256
    const signResult = await window.mina.signMessage({
        message: inputComment.value,
    })
    // submit
    const dto = {
        projectType: props.projectType,
        projectAddress: props.address,
        fromId: appState.connectedWallet58,
        comment: inputComment.value,
        signature: signResult,
        createdAt: new Date()
    } as CommentDto;
    const id = await submitComment(dto);
    if (id != -1) {
        dto.id = id;
        (dto as any as CommentDtoExtend).children = [];
        commentDatalist.commentlist.push((dto as any as CommentDtoExtend));
    }

    inputComment.value = '';
}

const addChildComment = async (parentCommentId: number, toId: string) => {
    // trigger signature
    //

    // submit
    const dto = {
        projectType: props.projectType,
        projectAddress: props.address,
        fromId: appState.connectedWallet58,
        toId,
        parentCommentId,
        signature: '',
        createdAt: new Date()
    } as CommentDto;

    if (inputComment2.value.indexOf(`@${omitAddress(toId)}`) == 0) {
        dto.comment = inputComment2.value.substring(inputComment2.value.indexOf(`@${omitAddress(toId)}`) + `@${omitAddress(toId)}`.length)
    } else if (inputComment2.value.indexOf(`@${omitAddress(toId)} `) == 0) {
        dto.comment = inputComment2.value.substring(inputComment2.value.indexOf(`@${omitAddress(toId)} `) + `@${omitAddress(toId)} `.length)
    } else {
        dto.comment = inputComment2.value;
    }

    const id = await submitComment(dto);
    if (id != -1) {
        dto.id = id;
        (dto as any as CommentDtoExtend).children = [];
        commentDatalist.commentlist.filter(c => c.id == parentCommentId)[0].children.push((dto as any as CommentDtoExtend));
    }

    showItemId.value = -1;
    inputComment2.value = '';
}

const InputCancel = () => {
    inputComment.value = '';
}

const InputCancel2 = () => {
    inputComment2.value = '';
}

const replyClick = async (parentCommentId: number, currentCommentId: number, toId?: string) => {
    if (!appState.connectedWallet58) {
        ElMessage({
            showClose: true,
            type: 'warning',
            message: `Please connect your wallet first, and then you can leave a comment .`,
        });

        return;
    }

    // add prefix
    inputComment2.value = `@${omitAddress(toId)} `;

    // show reply input
    showItemId.value = currentCommentId;
};

</script>

<template>
    <div class="comment-container">

        <h2 class="conment-title">All comments</h2>

        <div class="Comment">
            <transition name="fade">
                <div class="input-wrapper" v-show="true">
                    <el-input class="gray-bg-input" type="textarea" :rows="3" autofocus placeholder="Write your comment"
                        v-model="inputComment">
                    </el-input>
                    <div class="first-comment-input">
                        <span class="cancel" @click="InputCancel">Cancel</span>
                        <el-button class="btn" type="success" round @click="addComment">Confirm</el-button>
                    </div>
                </div>
            </transition>
        </div>


        <div class="Comment" v-for="item in commentDatalist.commentlist" :key="item.id">

            <div class="info">
                <div class="right">
                    <el-row>
                        <el-col :span="1"><el-avatar :icon="UserFilled" class="avatar" /></el-col>
                        <el-col :span="1"></el-col>
                        <el-col :span="21">
                            <div class="name" v-if="item.fromId == appState.connectedWallet58">You</div>
                            <div class="name" v-else>{{ omitAddress(item.fromId) }}</div>
                            <div class="date">{{ item.createdAt }}</div>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <div class="content">{{ item.comment }}</div>

            <div class="control">

                <span class="comment-reply" @click="replyClick(item.id, item.id, item.fromId)">
                    <el-icon class="iconfont icon-comment">
                        <ChatDotSquare />
                    </el-icon>
                    <span>reply</span>
                </span>

                <transition name="fade">
                    <div class="input-wrapper" v-if="showItemId == item.id">
                        <el-input class="gray-bg-input" v-model="inputComment2" type="textarea" :rows="3" autofocus
                            placeholder="Write your comment">
                        </el-input>
                        <div class="btn-control">
                            <span class="cancel" @click="InputCancel2">Cancel</span>
                            <el-button class="btn" type="success" round
                                @click="addChildComment(item.id, item.fromId)">Confirm</el-button>
                        </div>
                    </div>
                </transition>

            </div>

            <div class="reply">

                <div class="item" v-for="reply in item.children" :key="reply.id">

                    <div class="reply-content">
                        <div>
                            <span class="from-name" v-if="reply.fromId == appState.connectedWallet58">You</span>
                            <span class="from-name" v-else>{{ omitAddress(reply.fromId) }}</span>
                            <span> : </span>
                        </div>

                        <span class="to-name" v-if="reply.toId == appState.connectedWallet58">@You</span>
                        <span class="to-name" v-else>@{{ omitAddress(reply.toId) }}</span>
                        <span>{{ reply.comment }}</span>
                    </div>

                    <div class="reply-bottom">
                        <span>{{ reply.createdAt }}</span>

                        <span class="reply-text" @click="replyClick(item.id, reply.id, reply.fromId)">
                            <el-icon class="iconfont icon-comment">
                                <ChatDotSquare />
                            </el-icon>
                            <span>reply</span>
                        </span>
                    </div>

                    <transition name="fade">
                        <div class="input-wrapper" v-if="showItemId == reply.id">
                            <el-input class="gray-bg-input" v-model="inputComment2" type="textarea" :rows="3" autofocus
                                placeholder="Write your comment">
                            </el-input>
                            <div class="btn-control">
                                <span class="cancel" @click="InputCancel2">Cancel</span>
                                <el-button class="btn" type="success" round
                                    @click="addChildComment(item.id, reply.fromId)">Confirm</el-button>
                            </div>
                        </div>
                    </transition>

                </div>

            </div>

        </div>

    </div>
</template>


<style scoped lang="less">
.comment-container {
    padding: 0 10px;
    box-sizing: border-box;

    .Comment {
        display: flex;
        flex-direction: column;
        padding: 10px;
        border-bottom: 1px solid #F2F6FC;
        width: 100%;

        .conment-title {
            border-left: 4px solid #00FFC2;
            padding-left: 12px;
        }

        .first-comment-input {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding-top: 10px;

            .cancel {
                font-size: 16px;
                color: #606266;
                margin-right: 20px;
                cursor: pointer;

                &:hover {
                    color: #00c798;
                }
            }

            .btn {
                font-size: 16px;
                background-color: #00c798;

                &:hover {
                    color: #333;
                }
            }

            .confirm {
                font-size: 16px;
            }
        }

        .info {
            display: flex;
            align-items: center;

            .right {
                width: 100%;
                display: flex;
                flex-direction: column;
                // margin-left: 10px;

                .avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                }

                .name {
                    font-size: 16px;
                    color: #00c798;
                    margin-bottom: 5px;
                    font-weight: 500;
                }

                .date {
                    font-size: 12px;
                    color: #909399;
                }
            }
        }

        .content {
            font-size: 16px;
            color: #303133;
            line-height: 20px;
            padding: 10px 0;
        }

        .control {
            width: 100%;
            // display: flex;
            align-items: center;
            font-size: 14px;
            color: #909399;

            .like {
                display: flex;
                align-items: center;
                margin-right: 20px;
                cursor: pointer;

                &.active,
                &:hover {
                    color: #303133;
                }

                .iconfont {
                    font-size: 14px;
                    margin-right: 5px;
                }
            }

            .comment-reply {
                display: flex;
                align-items: center;
                cursor: pointer;
                font-size: 14px;

                &:hover {
                    color: #00c798;
                }

                .iconfont {
                    font-size: 16px;
                    margin-right: 5px;
                }
            }

        }

        .reply {
            margin: 10px 0;
            border-left: 2px solid #DCDFE6;

            .item {
                margin: 0 10px;
                padding: 10px 0;
                border-bottom: 1px dashed #EBEEF5;

                .reply-content {
                    display: flex;
                    align-items: center;
                    font-size: 16px;
                    color: #303133;

                    .from-name {
                        color: #00c798;
                    }

                    .to-name {
                        color: #00c798;
                        margin-left: 5px;
                        margin-right: 5px;
                    }
                }

                .reply-bottom {
                    display: flex;
                    align-items: center;
                    margin-top: 6px;
                    font-size: 12px;
                    color: #909399;

                    .reply-text {
                        display: flex;
                        align-items: center;
                        margin-left: 10px;
                        cursor: pointer;
                        font-size: 14px;

                        &:hover {
                            color: #00c798;
                        }

                        .icon-comment {
                            font-size: 16px;
                            margin-right: 5px;
                        }
                    }
                }
            }

            .write-reply {
                display: flex;
                align-items: center;
                font-size: 14px;
                color: #909399;
                padding: 10px;
                cursor: pointer;

                &:hover {
                    color: #303133;
                }

                .el-icon-edit {
                    margin-right: 5px;
                }
            }

            .fade-enter-active,
            fade-leave-active {
                transition: opacity 0.5s;
            }

            .fade-enter,
            .fade-leave-to {
                opacity: 0;
            }

            // .input-wrapper {
            //     padding: 10px;

            //     // .gray-bg-input,
            //     // .el-input__inner {
            //     //   /*background-color: #67C23A;*/
            //     // }

            //     .btn-control {
            //         display: flex;
            //         justify-content: flex-end;
            //         align-items: center;
            //         padding-top: 10px;

            //         .cancel {
            //             font-size: 16px;
            //             color: #606266;
            //             margin-right: 20px;
            //             cursor: pointer;

            //             &:hover {
            //                 color: #00c798;
            //             }
            //         }

            //         .btn {
            //             font-size: 16px;
            //             background-color: #00c798;

            //             &:hover {
            //                 color: #333;
            //             }
            //         }

            //         .confirm {
            //             font-size: 16px;
            //         }
            //     }
            // }
        }

        .input-wrapper {
            padding: 10px;

            // .gray-bg-input,
            // .el-input__inner {
            //   /*background-color: #67C23A;*/
            // }

            .btn-control {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                padding-top: 10px;

                .cancel {
                    font-size: 16px;
                    color: #606266;
                    margin-right: 20px;
                    cursor: pointer;

                    &:hover {
                        color: #00c798;
                    }
                }

                .btn {
                    font-size: 16px;
                    background-color: #00c798;

                    &:hover {
                        color: #333;
                    }
                }

                .confirm {
                    font-size: 16px;
                }
            }
        }
    }
}
</style>
