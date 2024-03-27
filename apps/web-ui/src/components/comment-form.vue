<script lang="ts" setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import { useStatusStore } from '@/stores'
import { ElMessage } from 'element-plus'

const { appState, showLoadingMask, setConnectedWallet, closeLoadingMask } = useStatusStore();

interface Comment {
  id: number;
  content: string;
  parentId: number | null;
  children: Comment[];
  user: { name: string };
  showReply: boolean;
}

const props = defineProps({
  comments: {
    type: Array as () => Comment[],
    required: true,
  },
});

const emit = defineEmits(['reply']);

const commentFormData = [
  {
    id: 'comment0001', //主键id
    date: '2018-07-05 08:30',  //评论时间
    ownerId: 'talents100020', //文章的id
    fromId: 'errhefe232213',  //评论者id
    fromName: '犀利的评论家',   //评论者昵称
    fromAvatar: 'http://ww4.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2pddjuj30v90uvagf.jpg', //评论者头像
    likeNum: 3, //点赞人数
    content: '非常靠谱的程序员',  //评论内容
    reply: [  //回复，或子评论
      {
        id: '34523244545',  //主键id
        commentId: 'comment0001',  //父评论id，即父亲的id
        fromId: 'observer223432',  //评论者id
        fromName: '夕阳红',  //评论者昵称
        fromAvatar: 'https://wx4.sinaimg.cn/mw690/69e273f8gy1ft1541dmb7j215o0qv7wh.jpg', //评论者头像
        toId: 'errhefe232213',  //被评论者id
        toName: '犀利的评论家',  //被评论者昵称
        toAvatar: 'http://ww4.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2pddjuj30v90uvagf.jpg',  //被评论者头像
        content: '赞同，很靠谱，水平很高',  //评论内容
        date: '2018-07-05 08:35'   //评论时间
      },
      {
        id: '34523244545',
        commentId: 'comment0001',
        fromId: 'observer567422',
        fromName: '清晨一缕阳光',
        fromAvatar: 'http://imgsrc.baidu.com/imgad/pic/item/c2fdfc039245d688fcba1b80aec27d1ed21b245d.jpg',
        toId: 'observer223432',
        toName: '夕阳红',
        toAvatar: 'https://wx4.sinaimg.cn/mw690/69e273f8gy1ft1541dmb7j215o0qv7wh.jpg',
        content: '大神一个！',
        date: '2018-07-05 08:50'
      }
    ]
  },
  {
    id: 'comment0002',
    date: '2018-07-05 08:30',
    ownerId: 'talents100020',
    fromId: 'errhefe232213',
    fromName: '毒蛇郭德纲',
    fromAvatar: 'http://ww1.sinaimg.cn/bmiddle/006DLFVFgy1ft0j2q2p8pj30v90uzmzz.jpg',
    likeNum: 0,
    content: '从没见过这么优秀的人',
    reply: []
  }

];

const newComment = ref('');
const replyInput = ref('');
const replyTarget = ref<{ name: string }>({ name: '' });

const postComment = () => {
  if (newComment.value) {
    newComment.value = '';
  }
};

const postReply = (comment: Comment) => {
  if (replyInput.value) {
    replyInput.value = '';
    replyTarget.value = { name: '' };
    comment.showReply = false;
  }
};

const showReplyInput = (comment: Comment) => {
  comment.showReply = true;
  replyTarget.value = comment.user;
};

const likeClick = (item: { isLike: boolean; likeNum: number; }) => {
  if (item.isLike === null) {
    item.isLike = true;
    item.likeNum++;
  } else {
    item.likeNum += item.isLike ? -1 : 1;
    item.isLike = !item.isLike;
  }
}

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


</script>
<template>
  <div class="comment-form">
    <div v-for="comment in comments" :key="comment.id" class="comment">
      <div class="comment-header">
        <span class="user-name">{{ comment.user.name }}</span>
        <button @click="showReplyInput(comment)">reply</button>
      </div>
      <div class="comment-content">{{ comment.content }}</div>
      <div class="reply-input" v-if="comment.showReply">
        <input type="text" v-model="replyInput" :placeholder="`@${replyTarget.name} `"
          @keyup.enter="postReply(comment)" />
        <button @click="postReply(comment)">Send</button>
      </div>
      <div class="child-comments">
        <CommentItem v-for="child in comment.children" :key="child.id" :comment="child" @reply="showReplyInput" />
      </div>
    </div>
    <div class="new-comment">
      <input type="text" v-model="newComment" @keyup.enter="postComment" />
      <button @click="postComment">Post comments</button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.comment-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  .comment {
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-bottom: 1px solid $border-fourth;

    .comment-header {
      cursor: pointer;

      .user-name {
        font-size: 16px;
        color: $text-main;
        margin-bottom: 5px;
        font-weight: 500;
      }

      &:hover {
        color: $text-333;
      }
    }

    .child-comments {
      display: flex;
      align-items: center;

      .name {
        font-size: 16px;
        color: $text-main;
        margin-bottom: 5px;
        font-weight: 500;
      }

      .date {
        font-size: 12px;
        color: $text-minor;
      }
    }

    .comment-content {
      font-size: 16px;
      color: $text-main;
      line-height: 20px;
      padding: 10px 0;
    }

  }

  .comment-textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }

  .comment-submit:hover {
    background-color: #45a049;
  }
}
</style>