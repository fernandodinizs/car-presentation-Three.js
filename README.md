# GARAGE — Vehicle Experience

Site experimental visual de veículo com React + Three.js + GSAP + Lenis.

## Rodar

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado pelo Vite.

## Modelo 3D

O projeto já funciona sem arquivo externo de modelo: o carro é gerado diretamente com geometria Three.js (carroceria extrudada a partir de um perfil lateral, cabine em vidro, frisos, aerofólio, faróis/lanternas emissivos e rodas), para a experiência funcionar imediatamente.

Para usar um modelo real, coloque um arquivo `.glb` em `public/models/` e substitua o componente `DemoCar` em `src/main.jsx` por um carregamento via `useGLTF`.

## Estrutura

- Navbar fixa com links diretos para as seções (Design, Performance, Dimensions, Cockpit) + CTA de reserva
- Menu lateral (hamburguer) com todas as seções, incluindo Reserva
- Hero imersivo com indicador de scroll animado (barra com gradiente descendo)
- Design
- Performance
- Motor
- Dimensões
- Cockpit
- Cena 3D interativa (arraste para girar, dica some após a primeira interação)
- Seção de reserva — cards de destaque + formulário de e-mail
- Encerramento (07 / THE MACHINE)
- Footer com links (Privacidade, Termos, Imprensa)
- Scroll suave via Lenis, sem barra de rolagem visível no navegador
- Animações de entrada e parallax via GSAP/ScrollTrigger