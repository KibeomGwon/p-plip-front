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
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = imageRef.value;
  
  // Crop box size (fixed 1:1 aspect ratio, e.g., 300x300 displayed)
  // We need to map the displayed crop box to the actual image coordinates
  
  // For simplicity in this custom implementation, we'll assume the crop box is the center of the view
  // and we capture what's visible in that box.
  
  const cropSize = 300; // The visual size of the crop box
  canvas.width = cropSize;
  canvas.height = cropSize;
  
  // Calculate draw parameters
  // The image is transformed by translate(x, y) and scale(s) relative to the center of the container
  // Container center = (containerWidth/2, containerHeight/2)
  
  // This math can be tricky. 
  // Simplified approach: Draw the image onto the canvas with the same transforms
  
  // But we want the resulting image to be the cropped version.
  
  // Let's try a different approach:
  // 1. Draw the image to a temporary canvas at full size.
  // 2. Extract the region corresponding to the crop box.
  
  // Actually, standard drawImage with transforms is easier.
  // Center of canvas = (150, 150)
  // We want to draw the image such that the point that is currently at the center of the crop box
  // ends up at the center of the canvas.
  
  // Current visual center of image = (imgWidth/2, imgHeight/2) + (x, y)
  // Wait, transform is applied to the element.
  
  // Let's use the visual values.
  // The crop box is centered in the .cropper-area.
  // .cropper-area is say 350x350. Crop box is 300x300.
  
  // Let's assume crop box IS the container for simplicity of math, or fixed size.
  
  // Let's simply draw the image into the canvas using the current scale and position.
  // Since the crop box is centered, we translate to center, apply transforms, then draw.
  
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, cropSize, cropSize);
  
  ctx.save();
  ctx.translate(cropSize / 2, cropSize / 2);
  ctx.translate(position.value.x, position.value.y);
  ctx.scale(scale.value, scale.value);
  // Draw image centered
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();
  
  canvas.toBlob((blob) => {
    emit('crop', blob);
  }, 'image/jpeg', 0.9);
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
