<script lang="ts" setup>
import { ref } from 'vue';
import { type Comment } from '@/models/comment'

const author = ref('');
const text = ref('');

const submitComment = async () => {
  if (author.value && text.value) {
    const newComment: Comment = {
      id: Date.now(), // 临时 ID，实际应从后端获取  
      author: author.value,
      text: text.value,
      timestamp: new Date(),
    };

    // 发送评论到后端  
    await postCommentToBackend(newComment);

    // 清空表单  
    author.value = '';
    text.value = '';
  }
};

// 模拟发送评论到后端  
const postCommentToBackend = async (comment: Comment) => {
  // 使用 axios 或其他 HTTP 客户端发送数据到后端  
  // 假设后端接口是 /api/comments  
  await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comment),
  });
};  
</script>

<template>
  <div class="comment-form">
    <input type="text" v-model="author" placeholder="Author" />
    <el-input class="comment-textarea" v-model="text" placeholder="Comment" type="textarea" />
    <el-button type="primary" class="comment-submit" @click="submitComment">Submit</el-button>
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