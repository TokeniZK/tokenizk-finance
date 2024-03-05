<script lang="ts" setup>
import { ref } from 'vue';
import CommentForm from './CommentForm.vue';

interface Comment {
  author: string;
  text: string;
}

const comments = ref<Comment[]>([]);

function addComment(newComment: Comment) {
  comments.value.push(newComment);
}

function deleteComment(index: number) {
  comments.value.splice(index, 1);
}

</script>

<template>
  <div>
    <div v-for="(comment, index) in comments" :key="index" class="comment">
      <h3>{{ comment.author }}</h3>
      <p>{{ comment.text }}</p>
      <button @click="deleteComment(index)">Delete</button>
    </div>
    <CommentForm @submitComment="addComment" />
  </div>
</template>
