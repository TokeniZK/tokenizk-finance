<script lang="ts" setup>
import { ref } from 'vue';

const author = ref('');
const text = ref('');

function submitComment() {
  if (author.value && text.value) {
    const comment = {
      author: author.value,
      text: text.value,
    };

    emit('submitComment', comment);

    author.value = '';
    text.value = '';
  }
}

const emit = (eventName: string, payload?: any) => {
  const event = new CustomEvent(eventName, {
    detail: payload,
  });
  window.dispatchEvent(event);
};

</script>

<template>
  <div>
    <input v-model="author" type="text" placeholder="Author" />
    <textarea v-model="text" placeholder="Comment"></textarea>
    <button @click="submitComment">Submit</button>
  </div>
</template>