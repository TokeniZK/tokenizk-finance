<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useStatusStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { omitAddress } from "@/utils"
import { type CommentDto } from '@tokenizk/types'
import { queryCommentByProjectAddr } from '@/apis/comment-api'

type CommentDtoExtend = CommentDto & { children: CommentDto[] }

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

// 定义响应式引用  
const comments = ref<any[]>([]);
const replyContext = ref('');
const context = ref('');
const username = ref('');
const userId = ref('');
const avatarUrl = ref('');
const secIdx = ref(0);
const firstIdx = ref(0);
const isShowSec = ref('');
const isClickId = ref('');
const articleId = ref('');

const props = defineProps<{
  address: string;
}>()

// const commentData = await queryCommentByProjectAddr(props.address)
const commentData = [] as CommentDto[];
console.log('commentData:', commentData);

// transform data into tree-pattern
const renderComments = commentData.filter(c1 => {
  return c1.parentCommentId
}) as CommentDtoExtend[];
renderComments.forEach(c => {
  c.children = commentData.filter(c2 => c2.parentCommentId == c.id)
});
console.log('renderComments:', renderComments);

let commentDatalist = reactive({ commentlist: renderComments });

const inputComment = ref('');
const inputComment2 = ref('');
const showItemId = ref('');

// const likeClick = (item: { isLike: boolean; likeNum: number; }) => {
//   if (item.isLike === null) {
//     item.isLike = true;
//     item.likeNum++;
//   } else {
//     item.likeNum += item.isLike ? -1 : 1;
//     item.isLike = !item.isLike;
//   }
// }

const replyClick = async () => {
  if (!appState.connectedWallet58) {
    ElMessage({
      showClose: true,
      type: 'warning',
      message: `Please connect your wallet first, and then you can leave a comment .`,
    });

    return;
  }
}

// 点击回复按钮时切换回复框的显示与隐藏状态
let ShowReplyInput = ref(false)
let toggleReplyBox = () => {
  ShowReplyInput.value = !ShowReplyInput.value;
};

const InputCancel = () => {
  inputComment.value = '';
}

const InputCancel2 = () => {
  inputComment2.value = '';
}

const commitComment = () => {
  console.log(inputComment.value);
}

/**
 * 点击评论按钮显示输入框
 * item: 当前大评论
 * reply: 当前回复的评论
 */

const itemObj = { id: 'item123' };
const replyObj = { fromId: 'user456' };
const showCommentInput = (item: { id: string; }, reply: { fromId: any; }) => {
  if (reply) {
    inputComment.value = `@${reply.fromId} `;
  } else {
    inputComment.value = '';
  }
  showItemId.value = item.id;
}

const addComment = async (id: string, replyName?: string) => {
  let res: { data?: any } = {};

  if (replyName) {
    // 添加二级评论  
    if (!replyContext.value) {
      ElMessage.warning("Comments or comments cannot be empty!");
      return;
    }

    res.data = {
      username: username.value,
      userId: userId.value,
      avatarUrl: avatarUrl.value,
      _id: "sec" + secIdx.value++, // 评论id  
      replyName,
      date: "2022.09.01", // 创建日期  
      favour: [], // 点赞的用户id  
      content: replyContext.value // 评论内容  
    };
    // 提交成功后更新本地评论列表  
    const comment = comments.value.find(item => item._id === id);
    if (!comment?.replyInfo) {
      comment.replyInfo = [];
    }
    comment.replyInfo.push(res.data);
    replyContext.value = "";
  } else {

    if (!context.value) {
      ElMessage.warning("Comments or comments cannot be empty!");
      return;
    }

    res.data = {
      username: username.value,
      avatarUrl: avatarUrl.value,
      userId: userId.value,
      _id: "first" + firstIdx.value++, // 评论id  
      date: "2022.09.01", // 创建日期  
      articleId: articleId.value, // 评论的文章id  
      favour: [], // 点赞的用户id  
      content: context.value // 评论内容  
    };
    // 提交成功后更新本地评论列表  
    comments.value.push(res.data);
    context.value = "";
  }
  isShowSec.value = isClickId.value = "";
};

</script>

<template>
  <div class="comment-container">

    <h2 class="conment-title">All comments</h2>

    <div class="Comment" style="margin-top: -40px;">
       <transition name="fade">
                <div class="input-wrapper">
                    <el-input class="gray-bg-input" type="textarea" :rows="3" autofocus placeholder="Write your comment"
            v-model="inputComment">
                     </el-input>
                    <div class="first-comment-input">
                        <span class="cancel" @click="InputCancel">Cancel</span>
                        <el-button class="btn" type="success" round @click="replyClick">Confirm</el-button>
                      </div>
                  </div>
          </transition>
    </div>

    <div class="Comment" v-for="items in commentDatalist.commentlist" :key="items.id">

      <div class="info">
        <el-image class="avatar" :src="items" />
        <div class="right">
          <div class="name">{{ items.fromId }}</div>
          <div class="date">{{ items.createdAt }}</div>
        </div>
      </div>

      <div class="content">{{ items.comment }}</div>

      <div class="control">
        <!-- <span class="like">
          <i class="iconfont icon-like"></i>
          <span class="like-num">40人赞</span>
        </span> -->
        <span class="comment-reply" @click="replyClick">
          <el-icon class="iconfont icon-comment">
            <ChatDotSquare />
          </el-icon>
          <span>reply</span>
        </span>
      </div>

      <div class="reply">
        <div class="item" v-for="reply in items.children" :key="reply.id">
          <div class="reply-content">
            <span class="from-name">{{ reply.fromId }}</span><span> : </span>
            <span class="to-name">@{{ reply.toId }}</span>
            <span>{{ reply.comment }}</span>
          </div>
          <div class="reply-bottom">
            <span>{{ reply.createdAt }}</span>
            <span class="reply-text" @click="showCommentInput(itemObj, replyObj)">
              <el-icon class="iconfont icon-comment">
                <ChatDotSquare />
              </el-icon>
              <span>reply</span>
            </span>
          </div>
        </div>

        <div class="write-reply" v-if="items.children.length > 0" @click="showCommentInput(itemObj, replyObj)">
          <i class="el-icon-edit"></i>
          <span class="add-comment">Add new comment</span>
        </div>

        <transition name="fade" v-if="ShowReplyInput">
          <div class="input-wrapper" v-if="true">
            <el-input class="gray-bg-input" v-model="inputComment" type="textarea" :rows="3" autofocus
              placeholder="Write your comment">
            </el-input>
            <div class="btn-control">
              <span class="cancel" @click="InputCancel2">Cancel</span>
              <el-button class="btn" type="success" round @click="replyClick">Confirm</el-button>
            </div>
          </div>
        </transition>
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
        // margin-right: 20px;
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

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
      }

      .right {
        display: flex;
        flex-direction: column;
        margin-left: 10px;

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
      display: flex;
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
          font-size: 16px;
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
}
</style>
