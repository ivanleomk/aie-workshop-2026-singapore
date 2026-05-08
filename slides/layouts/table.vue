<template>
  <div class="slidev-layout table-layout bg-white text-gray-800 h-full w-full flex flex-col pt-16 pb-16 pl-14 pr-14">
    <div class="table-content">
      <slot />
    </div>

    <img src="/pdf_img-000.png" class="absolute bottom-10 right-12 h-6" alt="Google" />
  </div>
</template>

<style scoped>
.table-content :deep(h1) {
  font-size: 2.25rem;
  line-height: 1.3;
  color: #0c4842;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
}

.table-content :deep(h2) {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem 0;
  font-weight: 500;
  color: #1f2937;
}

.table-content :deep(p) {
  font-size: 1rem;
  line-height: 1.6; 
  color: #374151;
  margin: 0 0 1.25rem 0;
}

.table-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  margin-top: 1.5rem;
  font-size: 0.875rem;
}

.table-content :deep(thead tr) {
  border-top: 1.5px solid #111827;
  border-bottom: 1.5px solid #111827;
}

.table-content :deep(th) {
  font-weight: 600;
  color: #111827;
  padding: 0.625rem 0.75rem 0.625rem 0;
}

.table-content :deep(td) {
  padding: 0.625rem 0.75rem 0.625rem 0;
  color: #111827;
  border-bottom: none;
}

.table-content :deep(tbody) {
  border-bottom: 1.5px solid #111827;
}

.table-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.85em;
  color: #111827;
}
</style>
