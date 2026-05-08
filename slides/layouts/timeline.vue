<template>
  <div class="slidev-layout timeline bg-white text-gray-800 h-full w-full px-10 py-10 flex flex-col relative">
    
    <!-- Title -->
    <h1 class="text-5xl font-semibold text-gray-800 m-0 tracking-tight">
      {{ $frontmatter.title || 'Timeline' }}
    </h1>

    <!-- Timeline Container -->
    <div class="flex-grow flex flex-col justify-center">
      
      <!-- ─── Top Row: even-indexed items above the line ─── -->
      <div class="timeline-row flex w-full items-end" style="min-height: 140px">
        <div
          v-for="(item, idx) in $frontmatter.timeline"
          :key="'top-' + idx"
          class="flex-1 flex flex-col items-start justify-end"
        >
          <template v-if="idx % 2 === 0">
            <div class="timeline-branch pl-4 pb-3 relative">
              <!-- Vertical connector line -->
              <div class="branch-line"></div>
              <div class="text-[0.85rem] font-semibold text-gray-800 leading-snug">{{ item.title }}</div>
              <div class="mt-1 space-y-0.5">
                <div
                  v-for="(line, li) in getLines(item)"
                  :key="li"
                  class="text-[0.7rem] text-gray-500 leading-snug flex items-start gap-1.5"
                >
                  <span class="text-[0.4rem] text-gray-400 mt-[0.35em] shrink-0">●</span>
                  <span>{{ line }}</span>
                </div>
              </div>
              <div class="text-[0.8rem] font-bold text-[#1558d6] mt-2">{{ item.year }}</div>
            </div>
          </template>
        </div>
      </div>

      <!-- ─── Horizontal Line ─── -->
      <div class="timeline-axis relative w-full flex items-center">
        <div class="absolute inset-x-0 h-[2px] bg-[#1558d6]"></div>
        <!-- Dots placed precisely on the line -->
        <div
          v-for="(item, idx) in $frontmatter.timeline"
          :key="'dot-' + idx"
          class="flex-1 relative"
        >
          <div class="timeline-dot"></div>
        </div>
      </div>

      <!-- ─── Bottom Row: odd-indexed items below the line ─── -->
      <div class="timeline-row flex w-full items-start" style="min-height: 140px">
        <div
          v-for="(item, idx) in $frontmatter.timeline"
          :key="'bot-' + idx"
          class="flex-1 flex flex-col items-start justify-start"
        >
          <template v-if="idx % 2 !== 0">
            <div class="timeline-branch pl-4 pt-3 relative">
              <!-- Vertical connector line -->
              <div class="branch-line-bottom"></div>
              <div class="text-[0.8rem] font-bold text-[#1558d6] mb-1">{{ item.year }}</div>
              <div class="text-[0.85rem] font-semibold text-gray-800 leading-snug">{{ item.title }}</div>
              <div class="mt-1 space-y-0.5">
                <div
                  v-for="(line, li) in getLines(item)"
                  :key="li"
                  class="text-[0.7rem] text-gray-500 leading-snug flex items-start gap-1.5"
                >
                  <span class="text-[0.4rem] text-gray-400 mt-[0.35em] shrink-0">●</span>
                  <span>{{ line }}</span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

    </div>

    <!-- Google Logo -->
    <img src="/pdf_img-000.png" class="absolute bottom-10 right-12 h-6 pointer-events-none" alt="Google" />
  </div>
</template>

<script setup>
function getLines(item) {
  return (item.subtitle || item.description || '').split('\n').filter(l => l.trim())
}
</script>

<style scoped>
/* Dot on the horizontal axis — perfectly centered */
.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #1558d6;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
  z-index: 10;
}

/* Vertical branch line for top items (grows upward from the axis) */
.timeline-branch {
  position: relative;
}

.branch-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #1558d6;
}

.branch-line-bottom {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #1558d6;
}

/* Axis container just needs to be tall enough for dots */
.timeline-axis {
  height: 2px;
  flex-shrink: 0;
}
</style>
