/**
 * HappyDev - Offline Developer Utilities Suite
 *
 * @author   TNQSW
 * @license  MIT (with Trademark Retention Notice)
 * @repo     https://github.com/xcoj027/happy-dev
 *
 * Copyright (c) 2026 TNQSW. All rights reserved.
 *
 * Trademark Notice:
 * Any derivative work, fork, modification, or redistribution of this software
 * must retain the original "TNQ" trademark, author credits, and notices of TNQSW.
 */

import React from 'react';

interface BackgroundArtworkProps {
  isDark: boolean;
}

export const BackgroundArtwork: React.FC<BackgroundArtworkProps> = ({ isDark }) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Dynamic Mesh Gradient Base */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isDark
            ? 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(15,23,42,0)),radial-gradient(ellipse_60%_60%_at_80%_100%,rgba(99,102,241,0.12),transparent),radial-gradient(ellipse_50%_50%_at_10%_80%,rgba(6,182,212,0.1),transparent)]'
            : 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(248,250,252,0)),radial-gradient(ellipse_60%_60%_at_85%_95%,rgba(99,102,241,0.12),transparent),radial-gradient(ellipse_50%_50%_at_5%_75%,rgba(6,182,212,0.12),transparent)]'
        }`}
      />

      {/* 2. Floating Luminous Aurora Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent blur-3xl animate-aurora-drift" />
      <div className="absolute top-[25%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-bl from-indigo-500/18 via-cyan-500/12 to-transparent blur-3xl animate-aurora-float" />
      <div className="absolute bottom-[-15%] left-[20%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-tr from-amber-500/12 via-rose-500/10 to-transparent blur-3xl animate-aurora-pulse" />

      {/* 3. Developer Artwork & Vector Tech Illustrator Layer */}
      <svg
        className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
          isDark ? 'opacity-[0.16]' : 'opacity-[0.11]'
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="bg-grid-dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill={isDark ? '#34d399' : '#059669'} />
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)'}
              strokeWidth="0.5"
            />
          </pattern>

          {/* Linear Gradients for Illustrations */}
          <linearGradient id="art-grad-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="art-grad-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <linearGradient id="art-grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>

        {/* Matrix Dot Background */}
        <rect width="100%" height="100%" fill="url(#bg-grid-dots)" />

        {/* Circuit Tracks & Node Graph (Top Right) */}
        <g stroke="url(#art-grad-emerald)" strokeWidth="1.2" fill="none" strokeDasharray="4 4" className="animate-subtle-drift">
          <path d="M 800,40 L 920,40 L 960,80 L 1100,80" />
          <circle cx="920" cy="40" r="3.5" fill="#10b981" stroke="url(#art-grad-emerald)" strokeWidth="1" />
          <circle cx="1100" cy="80" r="4.5" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
          
          <path d="M 850,90 L 900,140 L 1020,140" stroke="url(#art-grad-indigo)" />
          <circle cx="900" cy="140" r="3" fill="#6366f1" />
        </g>

        {/* Circuit Tracks (Bottom Left) */}
        <g stroke="url(#art-grad-indigo)" strokeWidth="1.2" fill="none" strokeDasharray="6 3">
          <path d="M 50,750 L 160,750 L 210,800 L 320,800" />
          <circle cx="160" cy="750" r="4" fill="#6366f1" />
          <circle cx="320" cy="800" r="3.5" fill="#a855f7" />
        </g>

        {/* Tech Geometric Rings & Abstract Elements */}
        <g transform="translate(150, 180)" stroke="url(#art-grad-emerald)" fill="none">
          <circle cx="0" cy="0" r="45" strokeWidth="1" strokeDasharray="3 6" className="animate-spin-very-slow" />
          <circle cx="0" cy="0" r="30" strokeWidth="0.8" opacity="0.6" />
          <polygon points="0,-16 14,8 -14,8" stroke="url(#art-grad-cyan)" strokeWidth="1" />
        </g>

        <g transform="translate(1080, 520)" stroke="url(#art-grad-indigo)" fill="none">
          <circle cx="0" cy="0" r="60" strokeWidth="1" strokeDasharray="4 8" className="animate-spin-reverse-slow" />
          <rect x="-25" y="-25" width="50" height="50" rx="12" stroke="url(#art-grad-emerald)" strokeWidth="1" transform="rotate(45)" />
        </g>

        {/* Floating Developer Symbols & Typography Artwork */}
        {/* Code Brackets: { } */}
        <g transform="translate(80, 420)" fill="url(#art-grad-emerald)" className="animate-float-gentle font-mono">
          <text fontSize="42" fontWeight="bold" opacity="0.75">&#123;</text>
        </g>
        <g transform="translate(1180, 310)" fill="url(#art-grad-indigo)" className="animate-float-gentle font-mono">
          <text fontSize="46" fontWeight="bold" opacity="0.75">&#125;</text>
        </g>

        {/* Code Angle Tags: < / > */}
        <g transform="translate(320, 90)" fill="url(#art-grad-emerald)" className="animate-float-reverse font-mono">
          <text fontSize="28" fontWeight="bold" opacity="0.6">&lt;/&gt;</text>
        </g>

        {/* Arrow Function: => */}
        <g transform="translate(940, 240)" fill="url(#art-grad-cyan)" className="animate-float-gentle font-mono">
          <text fontSize="26" fontWeight="bold" opacity="0.6">=&gt;</text>
        </g>

        {/* Async / Await glyph */}
        <g transform="translate(240, 720)" fill="url(#art-grad-amber)" className="animate-float-reverse font-mono">
          <text fontSize="22" fontWeight="bold" opacity="0.5">async / await</text>
        </g>

        {/* Binary Bits stream */}
        <g transform="translate(820, 680)" fill="url(#art-grad-indigo)" className="animate-float-gentle font-mono">
          <text fontSize="18" fontWeight="bold" letterSpacing="4" opacity="0.45">01101001</text>
        </g>

        {/* Star & Sparkle Accents */}
        <g transform="translate(480, 260)" fill="url(#art-grad-emerald)">
          <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" opacity="0.8" />
        </g>
        <g transform="translate(740, 160)" fill="url(#art-grad-amber)">
          <path d="M0,-10 L3,-3 L10,0 L3,3 L0,10 L-3,3 L-10,0 L-3,-3 Z" opacity="0.8" />
        </g>
        <g transform="translate(860, 480)" fill="url(#art-grad-cyan)">
          <path d="M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2 Z" opacity="0.7" />
        </g>
        <g transform="translate(180, 600)" fill="url(#art-grad-indigo)">
          <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
};
