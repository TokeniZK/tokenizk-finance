<script lang="ts" setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';

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


</script>
<template>
  <div>
    <div v-for="comment in comments" :key="comment.id" class="comment">
      <div class="comment-header">
        <span class="user-name">{{ comment.user.name }}</span>
        <button @click="showReplyInput(comment)">回复</button>
      </div>
      <div class="comment-content">{{ comment.content }}</div>
      <div class="reply-input" v-if="comment.showReply">
        <input type="text" v-model="replyInput" :placeholder="`@${replyTarget.name} `"
          @keyup.enter="postReply(comment)" />
        <button @click="postReply(comment)">发送</button>
      </div>
      <div class="child-comments">
        <CommentItem v-for="child in comment.children" :key="child.id" :comment="child" @reply="showReplyInput" />
      </div>
    </div>
    <div class="new-comment">
      <input type="text" v-model="newComment" @keyup.enter="postComment" />
      <button @click="postComment">发表评论</button>
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