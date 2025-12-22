<template>
  <div class="cropper-container" v-if="imageUrl">
    <div 
      class="cropper-area" 
      ref="cropperArea"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @mousemove="onDrag"
      @touchmove="onDrag"
      @mouseup="stopDrag"
      @mouseleave="stopDrag"
      @touchend="stopDrag"
    >
      <img 
        ref="imageRef"
        :src="imageUrl" 
        class="source-image"
        :style="imageStyle"
        @load="onImageLoad"
        draggable="false"
      />
      <div class="overlay">
        <div class="crop-box"></div>
      </div>
    </div>

    <div class="controls">
      <input 
        type="range" 
        :min="minScale" 
        max="3" 
        step="0.01" 
        v-model.number="scale" 
        @input="updateImageStyle"
        class="zoom-slider"
      />
      <div class="buttons">
        <button class="cancel-btn" @click="$emit('cancel')">취소</button>
        <button class="crop-btn" @click="cropImage">자르기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  imageFile: {
    type: File,
    required: true
  }
});

const emit = defineEmits(['crop', 'cancel']);

const imageUrl = ref('');
const imageRef = ref(null);
const cropperArea = ref(null);

const scale = ref(1);
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

// Load image file
onMounted(() => {
  if (props.imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imageUrl.value = e.target.result;
    };
    reader.readAsDataURL(props.imageFile);
  }
});

onUnmounted(() => {
  if (imageUrl.value) {
    // Clean up if needed, though data URLs don't need explicit revoke
  }
});

const imageStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px) scale(${scale.value})`,
  transformOrigin: 'center center'
}));

const minScale = ref(0.1);

const constrainPosition = (pos, s) => {
  if (!imageRef.value) return pos;
  
  const img = imageRef.value;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const cropSize = 300;
  
  const dw = naturalWidth * s;
  const dh = naturalHeight * s;
  
  // Calculate limits
  // The image center is at (150 + x, 150 + y)
  // Left edge: 150 + x - dw/2
  // Right edge: 150 + x + dw/2
  // Top edge: 150 + y - dh/2
  // Bottom edge: 150 + y + dh/2
  
  // Constraints:
  // Left edge <= 0  => x <= dw/2 - 150
  // Right edge >= 300 => x >= 150 - dw/2
  // Top edge <= 0 => y <= dh/2 - 150
  // Bottom edge >= 300 => y >= 150 - dh/2
  
  const maxX = Math.max(0, dw / 2 - 150);
  const minX = -maxX;
  const maxY = Math.max(0, dh / 2 - 150);
  const minY = -maxY;
  
  return {
    x: Math.min(Math.max(pos.x, minX), maxX),
    y: Math.min(Math.max(pos.y, minY), maxY)
  };
};

const onImageLoad = (e) => {
  const img = e.target;
  const naturalWidth = img.naturalWidth;
  const naturalHeight = img.naturalHeight;
  const cropSize = 300;
  
  const scaleX = cropSize / naturalWidth;
  const scaleY = cropSize / naturalHeight;
  
  // Minimum scale to cover the box
  const minS = Math.max(scaleX, scaleY);
  minScale.value = minS;
  
  // Set initial scale to min scale (max zoomed out)
  scale.value = minS;
  
  // Reset position
  position.value = { x: 0, y: 0 };
};

const startDrag = (e) => {
  isDragging.value = true;
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  dragStart.value = { 
    x: clientX - position.value.x, 
    y: clientY - position.value.y 
  };
};

const onDrag = (e) => {
  if (!isDragging.value) return;
  e.preventDefault();
  
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  
  const rawX = clientX - dragStart.value.x;
  const rawY = clientY - dragStart.value.y;
  
  position.value = constrainPosition({ x: rawX, y: rawY }, scale.value);
};

const stopDrag = () => {
  isDragging.value = false;
};

const updateImageStyle = () => {
  // When zooming, we might need to re-constrain position if the image shrinks
  position.value = constrainPosition(position.value, scale.value);
};

const cropImage = () => {
  const img = imageRef.value;
  const cropSize = 300; // Visual crop box size
  const scaleVal = scale.value;
  const pos = position.value;
  
  // Calculate the crop region in the original image's coordinates
  // 1. Determine how many pixels of the original image match the 300px visual area.
  //    If scale is 1, 300px visual = 300px original.
  //    If scale is 0.5, 300px visual = 600px original (we see more).
  const sourceWidth = cropSize / scaleVal;
  const sourceHeight = cropSize / scaleVal;
  
  // 2. Determine the top-left coordinate of the crop region on the original image.
  //    The image is centered visually at (150, 150) + (pos.x, pos.y).
  //    Inverse transform: Map visual (0,0) to image space.
  
  const naturalCenter_x = img.naturalWidth / 2;
  const naturalCenter_y = img.naturalHeight / 2;
  
  // Visual Center of crop box is (150, 150).
  // The pixel at Visual Center corresponds to the Image pixel at:
  // NaturalCenter - (pos / scale)
  // Wait, if pos.x is positive (shifted right), the center of the crop box sees pixels to the LEFT of the image center.
  // So: ImagePoint = NaturalCenter - (pos / scale).
  
  // Top-left of crop box is (-150, -150) relative to Visual Center.
  // So in image space, that's -150/scale relative to ImagePoint.
  
  const sourceX = naturalCenter_x - (pos.x / scaleVal) - (cropSize / 2 / scaleVal);
  const sourceY = naturalCenter_y - (pos.y / scaleVal) - (cropSize / 2 / scaleVal);
  
  // Create canvas at full resolution of the source region
  const canvas = document.createElement('canvas');
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;
  const ctx = canvas.getContext('2d');
  
  // Use high quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw the portion of the original image directly onto the canvas
  // We clamps the values to avoid index errors, though constrainPosition should basically handle it.
  ctx.drawImage(
    img, 
    sourceX, sourceY, sourceWidth, sourceHeight, 
    0, 0, sourceWidth, sourceHeight
  );
  
  // Export at maximum quality
  canvas.toBlob((blob) => {
    emit('crop', blob);
  }, 'image/jpeg', 1.0);
};
</script>

<style scoped>
.cropper-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  background: #000;
  padding: 20px;
  border-radius: 12px;
}

.cropper-area {
  width: 300px;
  height: 300px;
  position: relative;
  overflow: hidden;
  background: #333;
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-image {
  max-width: none; /* Allow scaling beyond container */
  /* Initial size logic could be improved, but let's rely on CSS centering */
  display: block;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5); /* Dim outside */
}

.crop-box {
  width: 100%;
  height: 100%;
  border: 2px solid white;
  box-sizing: border-box;
}

.controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.zoom-slider {
  width: 100%;
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #eee;
  color: #333;
}

.crop-btn {
  background: #0095f6;
  color: white;
}
</style>
