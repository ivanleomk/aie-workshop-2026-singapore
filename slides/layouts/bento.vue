<template>
  <div class="slidev-layout bento bg-white text-gray-800 h-full w-full p-12 flex flex-col">
    <div class="prose-h1:text-4xl prose-h1:font-medium prose-h1:text-gray-800 prose-h1:m-0 mb-8">
      <slot name="header" />
    </div>
    
    <div class="grid grid-cols-2 gap-6 flex-1 [&>div]:bg-gray-50 [&>div]:rounded-2xl [&>div]:p-6 [&>div]:border [&>div]:border-gray-200 shadow-sm">
      <slot />
    </div>

    <img src="/pdf_img-000.png" class="absolute bottom-10 right-12 h-6" alt="Google" />
  </div>
</template>
