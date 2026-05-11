<template>
  <div class="slidev-layout agenda bg-white text-gray-800 h-full w-full flex">
    <div class="w-1/3 h-full flex flex-col justify-center pl-12">
      <div class="text-6xl font-medium text-gray-800 prose-h1:m-0 prose-h1:font-medium">
        <slot />
      </div>
    </div>
    
    <div class="w-2/3 h-full flex flex-col justify-center pl-10 gap-8 text-2xl text-gray-700">
      <slot name="right" />
    </div>

    <img src="/Lockup.png" class="absolute bottom-4 right-6 max-w-[200px] my-8 h-[30px] z-50" alt="Google DeepMind" />
  </div>
</template>
