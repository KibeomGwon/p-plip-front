import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        // 2. PWA 플러그인 설정 추가
        VitePWA({
            registerType: 'autoUpdate', // 업데이트 시 자동 새로고침 (가장 편함)
            //프로덕션 모드에서 작동하도록 설정
            mode: 'production',
            devOptions: {
                enabled: true // 개발 환경에서도 PWA 작동 확인 가능하도록 설정
            },
            manifest: {
                name: 'P-PliP - 여행 성향 맞춤 앱', // 앱 전체 이름
                short_name: 'P-PliP', // 홈 화면 아이콘 아래 들어갈 짧은 이름
                description: 'MBTI P들을 위한 여행 계획 어플리케이션',
                theme_color: '#ffffff', // 상단 상태바 색상
                icons: [
                    {
                        src: 'pwa-192x192.png', // public 폴더에 이 이미지가 있어야 함
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png', // public 폴더에 이 이미지가 있어야 함
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        }),
        vueDevTools()
    ],
    server: {// 1. 외부 접속 허용
        host: '0.0.0.0',
        // 2. 포트 고정 (필요시)
        port: 5173,

        // 3. HMR(새로고침) 설정 (이게 핵심!)
        hmr: {
            clientPort: 443, // 클라이언트는 https(443)로 접속한다고 알려줌
            host: 'm.pplip.c01.kr', // 내 도메인 주소
            protocol: 'wss' // 보안 웹소켓 사용
        },

        // 4. 허용된 호스트 목록 추가 (보안 에러 방지)
        allowedHosts: [
            'm.pplip.c01.kr',
            'pplip.c01.kr'
        ]
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
})
