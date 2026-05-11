<template>
  <div class="slidev-layout section bg-white text-gray-800 h-full w-full">
    <div class="h-full flex flex-col justify-center items-center text-center">
      <div v-if="$frontmatter.number" class="text-2xl font-bold text-[#1558d6] mb-4">
        {{ String($frontmatter.number).padStart(2, '0') }}
      </div>
      <div class="section-content prose-h1:text-7xl prose-h1:m-0 prose-h1:font-normal prose-h1:tracking-tight prose-p:text-3xl prose-p:text-gray-500 prose-p:mt-6 prose-p:font-light max-w-4xl">
        <slot />
      </div>
    </div>

    <img src="/google_deepmind-192px.svg" class="absolute bottom-10 right-12 h-8" alt="Google DeepMind" />
  </div>
</template>

<style scoped>
.section-content :deep(h1) {
  color: #1558d6 !important;
}
</style>
