<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

interface Comment {
  id: number;
  content: string;
  favour: string[];
}

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  comments: {
    type: Array,
    required: true,
  },
});

const comments = ref<Comment[]>([]);
const userId = ref<string>('');
const handleUpdateComment = (updatedComment: Comment) => {
  // 根据评论ID更新评论列表中的对应项  
  const index = comments.value.findIndex(comment => comment.id === updatedComment.id);
  if (index !== -1) {
    comments.value[index] = updatedComment;
  }
}

const handleDeleteComment = (commentId: number) => {
  // 根据评论ID从评论列表中删除对应项  
  const index = comments.value.findIndex(comment => comment.id === commentId);
  if (index !== -1) {
    // 假设删除评论是异步操作，需要向后端发送请求  
    // 这里简化处理，直接删除本地数据  
    comments.value.splice(index, 1);
    ElMessage.success('评论删除成功！');
  } else {
    ElMessage.error('评论不存在！');
  }
}
</script>

<template>
  <div class="comment-list">
    <div v-for="(comment, index) in comments" :key="index" class="comment-item">
      <p>{{ comment.content }}</p>
      <button @click="handleDeleteComment(index)">Delete</button>
    </div>
  </div>
</template>

<style scoped>
.comment-list {
  padding: 0 10px;
  box-sizing: border-box;
}

.comment-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
