<template>
  <div class="hero-sections">
    <div class="hero-block">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Simple Params Validation</h1>
          <div class="hero-description">
            Require <code>id</code> to be a number
          </div>
        </div>
        <a href="/validation/params" class="details-button">Details →</a>
      </div>
      <div class="hero-image" @click="openLightbox('/ParamsValidation001.png', 'Simple params validation')">
        <img src="/ParamsValidation001.png" alt="Simple params validation" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
    </div>

    <div class="divider" />

    <div class="hero-block">
      <div class="hero-image" @click="openLightbox('/ParamsValidation002.png', 'Refined params validation')">
        <img src="/ParamsValidation002.png" alt="Refined params validation" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Refined Params Validation</h1>
          <div class="hero-description">
            Require <code>id</code> to be a positive integer.<br />
            Use <code>TRefine</code> to specify JSON Schema constraints.
          </div>
        </div>
        <a href="/validation/params" class="details-button">Details →</a>
      </div>
    </div>

    <div class="divider" />

    <div class="hero-block">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Payload Validation</h1>
          <div class="hero-description">
            Use the first type argument to define the payload schema.
            <code>TRefine</code> can be used to specify JSON Schema constraints.
          </div>
        </div>
        <a href="/validation/payload" class="details-button">Details →</a>
      </div>
      <div class="hero-image" @click="openLightbox('/PayloadValidation.png', 'Payload validation')">
        <img src="/PayloadValidation.png" alt="Payload validation" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
    </div>

    <div class="divider" />

    <div class="hero-block">
      <div class="hero-image" @click="openLightbox('/ResponseValidation.png', 'Response validation')">
        <img src="/ResponseValidation.png" alt="Response validation" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Response Validation</h1>
          <div class="hero-description">
            Use the second type argument to define the response schema.
            <code>ctx.body</code> should match defined schema for validation to pass.
            <div class="text-hint">
              If no payload validation is needed, use <code>never</code> for the first argument.
            </div>
          </div>
        </div>
        <a href="/validation/response" class="details-button">Details →</a>
      </div>
    </div>

    <div class="divider" />

    <div class="hero-block">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Global Middleware</h1>
          <div class="hero-description">
            Define middleware to run on every route.
            Use the <code>slot</code> option to allow routes to override this middleware later.
            Use the <code>on</code> option to run middleware only for specific HTTP methods.
          </div>
        </div>
        <a href="/api-server/use-middleware/slot-composition" class="details-button">Details →</a>
      </div>
      <div class="hero-image" @click="openLightbox('/GlobalMiddleware.png', 'Global Middleware')">
        <img src="/GlobalMiddleware.png" alt="Global Middleware" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
    </div>

    <div class="divider" />

    <div class="hero-block">
      <div class="hero-image" @click="openLightbox('/OverrideGlobalMiddleware.png', 'Override Middleware')">
        <img src="/OverrideGlobalMiddleware.png" alt="Override Middleware" loading="lazy" />
        <div class="zoom-hint">🔍 Click to zoom</div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Override Middleware</h1>
          <div class="hero-description">
            Use the <code>slot</code> option in routes to override global middleware with the same slot name.
            Eg., for file upload routes, use a form body parser instead of the default JSON parser.
            <div class="text-hint">
              Feel free to use any <code>Koa</code>-compatible middleware — not just those provided by <code>KappaJS</code>.
            </div>
          </div>
        </div>
        <a href="/api-server/use-middleware/slot-composition" class="details-button">Details →</a>
      </div>
    </div>


    <!-- Lightbox backdrop -->
    <Transition name="fade">
      <div v-if="lightboxOpen" class="lightbox-backdrop" @click="closeLightbox">
        <div class="lightbox-content" @click="closeLightbox">
          <img :src="lightboxImage" :alt="lightboxAlt" />
          <div class="close-hint">⨯ Click to close</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const lightboxOpen = ref(false)
const lightboxImage = ref("")
const lightboxAlt = ref("")

const openLightbox = (imageSrc, altText) => {
  lightboxImage.value = imageSrc
  lightboxAlt.value = altText
  lightboxOpen.value = true
  document.body.style.overflow = "hidden"
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ""
}

const handleEscape = (event) => {
  if (event.key === "Escape" && lightboxOpen.value) {
    closeLightbox()
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleEscape)
})

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscape)
})
</script>

<style scoped>
.hero-sections {
  margin: 0 auto;
  padding: 2rem 1rem;
}

.hero-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem 0;
}

.hero-content {
  flex: 0 1 auto;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  order: -1;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 1rem 0;
  color: var(--vp-c-brand-1, #3451b2);
  white-space: nowrap;
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--vp-c-text-2, #476582);
  margin-bottom: 0;
}

.details-button {
  display: inline-block;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
  transition: color 0.25s, border-color 0.25s, background-color 0.25s;
  border-radius: 20px;
  padding: 0 20px;
  line-height: 38px;
  border-color: var(--vp-button-brand-border);
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
  flex-shrink: 0;
}

.details-button:hover {
  border-color: var(--vp-button-brand-hover-border);
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
}

.hero-image {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.text-hint {
  margin-top: 0.5rem;
  font-size: 1rem;
  color: var(--vp-c-text-3, #a0a0a0);
}

.zoom-hint {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-3, #a0a0a0);
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.hero-image:hover .zoom-hint {
  opacity: 1;
  color: var(--vp-c-brand-1, #3451b2);
}

.hero-image img {
  max-width: 100%;
  height: auto;
}

.divider {
  height: 1px;
  background: var(--vp-c-divider, #e2e2e3);
  margin: 2rem 0;
}

/* Lightbox styles */
.lightbox-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 2rem;
  cursor: pointer;
}

.lightbox-content {
  position: relative;
  max-width: 95%;
  max-height: 95%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-hint {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Media Queries - Mobile First */
@media (min-width: 961px) {
  .hero-block {
    flex-direction: row;
    gap: 3rem;
    padding: 3rem 0;
  }

  .hero-content {
    flex-direction: column;
    order: 0;
  }

  .hero-description {
    margin-bottom: 1.5rem;
  }
}
</style>
