<template>
  <div class="hero-sections">
    <div class="hero-block" :class="{ 'image-hovered': zoomedBlock === 1 }">
      <div class="hero-text">
        <h1 class="hero-title">Simple params validation</h1>
        <div class="hero-description">
          make sure <code>id</code> is a number
        </div>
      </div>
      <div class="hero-image" @click="toggleZoom(1)">
        <img src="/ParamsValidation001.png" alt="Simple params validation" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
    </div>

    <div class="divider" />

    <div class="hero-block" :class="{ 'image-hovered': zoomedBlock === 2 }">
      <div class="hero-image" @click="toggleZoom(2)">
        <img src="/ParamsValidation002.png" alt="Refined params validation" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
      <div class="hero-text">
        <h1 class="hero-title">Refined params validation</h1>
        <div class="hero-description">
          Make sure <code>id</code> is a positive integer.<br />
          Use <code>TRefine</code> as a JSON Schema wrapper.
        </div>
      </div>
    </div>

    <div class="divider" />

    <div class="hero-block" :class="{ 'image-hovered': zoomedBlock === 3 }">
      <div class="hero-text">
        <h1 class="hero-title">Payload validation</h1>
        <div class="hero-description">
          Use the first type argument to define the payload schema.
          <code>TRefine</code> can be used as a JSON Schema wrapper.
        </div>
      </div>
      <div class="hero-image" @click="toggleZoom(3)">
        <img src="/PayloadValidation.png" alt="Payload validation" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
    </div>

    <div class="divider" />

    <div class="hero-block" :class="{ 'image-hovered': zoomedBlock === 4 }">
      <div class="hero-image" @click="toggleZoom(4)">
        <img src="/ResponseValidation.png" alt="Response validation" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
      <div class="hero-text">
        <h1 class="hero-title">Response validation</h1>
        <div class="hero-description">
          Use the second type argument to define the response schema.
          If no payload validation is needed, use <code>never</code> for the first argument.
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const zoomedBlock = ref(0)

const toggleZoom = (blockId) => {
  zoomedBlock.value = zoomedBlock.value === blockId ? 0 : blockId
}
</script>

<style scoped>
.hero-sections {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.hero-block {
  display: flex;
  align-items: flex-start;
  gap: 3rem;
  padding: 3rem 0;
  transition: all 0.5s ease;
}

.hero-block.image-hovered {
  flex-direction: column;
  gap: 0;
}

.hero-block.image-hovered .hero-text {
  opacity: 0;
  flex: 0;
  max-width: 0;
  max-height: 0;
  overflow: hidden;
}

.hero-block.image-hovered .hero-image {
  flex: 1;
  width: 100%;
}

@media (max-width: 1200px) {
  .hero-block {
    flex-direction: column;
    gap: 2rem;
    padding: 2rem 0;
  }
}

.hero-text {
  flex: 1;
  min-width: 0;
  transition: opacity 0.5s ease, flex 0.5s ease;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 1rem 0;
  color: var(--vp-c-brand-1, #3451b2);
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--vp-c-text-2, #476582);
}

.hero-description code {
  background: var(--vp-c-bg-soft, #f6f6f7);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: var(--vp-font-family-mono, 'Courier New', monospace);
  font-size: 0.9em;
  color: var(--vp-c-brand-1, #3451b2);
}

.hero-image {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: flex 0.5s ease;
  cursor: pointer;
  position: relative;
}

.zoom-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-3, #a0a0a0);
  opacity: 0.7;
  transition: opacity 0.5s ease;
}

.hero-image:hover .zoom-hint {
  opacity: 1;
  color: var(--vp-c-brand-1, #3451b2);
}

.hero-block.image-hovered .zoom-hint {
  opacity: 0;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.divider {
  height: 1px;
  background: var(--vp-c-divider, #e2e2e3);
  margin: 2rem 0;
}
</style>
