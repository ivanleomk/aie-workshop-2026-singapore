<template>
  <div class="slidev-layout one-col bg-white text-gray-800 h-full w-full flex flex-col pt-16 pb-16 pl-14 pr-14">
    <div class="one-col-content mx-auto w-full max-w-4xl">
      <slot />
    </div>
    
    <img src="/Lockup.png" class="absolute bottom-4 right-6 max-w-[200px] my-8 h-[30px] z-50" alt="Google DeepMind" />
  </div>
</template>

<style scoped>
.one-col-content :deep(h1) {
  font-size: 2.25rem; /* 4xl, a bit larger for one col */
  line-height: 1.3;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
  color: #1f2937; /* gray-800 */
}

.one-col-content :deep(h2) {
  font-size: 1.5rem; /* 2xl */
  line-height: 1.4;
  margin: 2rem 0 1rem 0;
  font-weight: 500;
  color: #1f2937; /* gray-800 */
}

.one-col-content :deep(p) {
  font-size: 1.125rem; /* lg */
  line-height: 1.6; 
  color: #374151; /* gray-700 */
  margin: 0 0 1.5rem 0;
  font-weight: 400;
}

.one-col-content :deep(ul) {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Evenly spaced */
  font-size: 1.125rem; /* lg */
  line-height: 1.6;
  color: #374151; /* gray-700 */
  list-style-type: none;
  padding: 0;
}

.one-col-content :deep(ul li) {
  position: relative;
  padding-left: 1.5rem;
}

.one-col-content :deep(ul li::before) {
  content: '▪';
  position: absolute;
  left: 0;
  top: 0.1em;
  font-size: 0.85em;
  color: #111827; /* black square */
}

.one-col-content :deep(code) {
  background-color: #f3f4f6; /* gray-100 */
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
  color: #111827; /* gray-900 */
}

.one-col-content :deep(blockquote) {
  border-left: 4px solid #4285F4; /* Google Blue */
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #4b5563; /* gray-600 */
  font-style: normal;
}

.one-col-content :deep(b), .one-col-content :deep(strong) {
  color: #111827; /* gray-900 */
  font-weight: 600;
}
</style>
