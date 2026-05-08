<template>
  <div class="slidev-layout two-cols bg-white text-gray-800 h-full w-full flex pt-16 pb-16 pl-14 pr-14">
    <div class="w-1/2 flex flex-col pr-8">
      <div class="two-cols-content">
        <slot />
      </div>
    </div>
    
    <div class="w-1/2 flex flex-col pl-8">
      <slot name="right" />
    </div>

    <img src="/pdf_img-000.png" class="absolute bottom-10 right-12 h-6" alt="Google" />
  </div>
</template>

<style scoped>
.two-cols-content :deep(h1) {
  font-size: 1.875rem; /* 3xl */
  line-height: 1.3;
  margin: 0 0 1.5rem 0;
  font-weight: 600;
  color: #1f2937; /* gray-800 */
}

.two-cols-content :deep(h2) {
  font-size: 1.25rem; /* xl */
  line-height: 1.4;
  margin: 2rem 0 1rem 0;
  font-weight: 500;
  color: #1f2937; /* gray-800 */
}

.two-cols-content :deep(p) {
  font-size: 1rem; /* base */
  line-height: 1.6; 
  color: #374151; /* gray-700 */
  margin: 0 0 1.25rem 0;
  font-weight: 400;
}

.two-cols-content :deep(ul) {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 1rem; /* base */
  line-height: 1.6;
  color: #374151; /* gray-700 */
  list-style-type: none;
  padding: 0;
}

.two-cols-content :deep(ul li) {
  position: relative;
  padding-left: 1.25rem;
}

.two-cols-content :deep(ul li::before) {
  content: '▪';
  position: absolute;
  left: 0;
  top: 0.1em;
  font-size: 0.85em;
  color: #111827; /* black square */
}

.two-cols-content :deep(code) {
  background-color: #f3f4f6; /* gray-100 */
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
  color: #111827; /* gray-900 */
}

.two-cols-content :deep(blockquote) {
  border-left: 4px solid #4285F4; /* Google Blue */
  padding-left: 1rem;
  margin: 1.5rem 0;
  color: #4b5563; /* gray-600 */
  font-style: normal;
}

.two-cols-content :deep(b), .two-cols-content :deep(strong) {
  color: #111827; /* gray-900 */
  font-weight: 600;
}

.two-cols-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.two-cols-content :deep(thead tr) {
  border-top: 1.5px solid #111827;
  border-bottom: 1.5px solid #111827;
}

.two-cols-content :deep(th) {
  font-weight: 600;
  color: #111827;
  padding: 0.75rem 0.5rem 0.75rem 0;
}

.two-cols-content :deep(td) {
  padding: 0.75rem 0.5rem 0.75rem 0;
  color: #374151;
  border-bottom: none;
}

.two-cols-content :deep(tbody) {
  border-bottom: 1.5px solid #111827;
}
</style>
