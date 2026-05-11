<template>
  <div class="slidev-layout title bg-white text-gray-800 h-full w-full">
    <img src="/google_deepmind-192px.svg" class="absolute top-10 left-12 h-12 z-50" alt="Google DeepMind" />
    
    <div class="h-full flex flex-col justify-center">
      <div class="title-content ml-4">
        <slot />
      </div>
    </div>

    <div class="absolute bottom-10 left-12" v-if="$frontmatter.speaker">
      <div class="border border-gray-400 rounded-full px-6 py-2 text-sm text-gray-700">
        {{ $frontmatter.speaker }}
        <span v-if="$frontmatter.email">, <a :href="'mailto:' + $frontmatter.email" class="text-google-blue no-underline">{{ $frontmatter.email }}</a></span>
        <span v-if="$frontmatter.website">, <a :href="'http://' + $frontmatter.website" class="text-google-blue no-underline">{{ $frontmatter.website }}</a></span>
      </div>
    </div>

    <div class="absolute bottom-12 right-12 text-sm text-gray-600" v-if="$frontmatter.date">
      {{ $frontmatter.date }}
    </div>
  </div>
</template>

<style scoped>
.title-content :deep(h1) {
  font-size: 5rem; /* ~7.5xl */
  line-height: 1.1;
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.025em;
  color: #111827; /* gray-900 */
}

.title-content :deep(p) {
  font-size: 1.875rem; /* 3xl */
  line-height: 1.375; /* leading-snug */
  color: #6b7280; /* gray-500 */
  margin-top: 1.5rem;
  font-weight: 300;
  max-width: 56rem; /* max-w-4xl */
  text-wrap: balance;
}
</style>
