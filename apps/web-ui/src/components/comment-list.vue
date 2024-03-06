<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import {type Comment} from '@/models/comment' 
  
const comments = ref<Comment[]>([]);  
  
// 模拟从后端获取评论数据  
const fetchComments = async () => {  
  // 使用 axios 或其他 HTTP 客户端从后端获取数据  
  // 假设返回的数据格式是 Comment[]  
  const response = await fetch('/api/comments');  
  const data = await response.json();  
  comments.value = data;  
};  
  
// 在组件挂载时获取评论数据  
onMounted(fetchComments);  

</script>

<template>  
  <div class="comment-list">  
    <div v-for="comment in comments" :key="comment.id" class="comment-item">  
      <h3>{{ comment.author }}</h3>  
      <p>{{ comment.text }}</p>  
      <span>{{ comment.timestamp.toLocaleString() }}</span>  
    </div>  
  </div>  
</template>

<style scoped>  
.comment-list {  
  /* 样式美化 */  
}  
  
.comment-item {  
  /* 样式美化 */  
}  
</style>


