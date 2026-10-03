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

export type ToolCategory =
  | 'converters'
  | 'encoders'
  | 'crypto'
  | 'formatters'
  | 'datetime'
  | 'text'
  | 'generators'
  | 'network';

export type DevRole =
  | 'All'
  | 'Backend'
  | 'Frontend'
  | 'Fullstack'
  | 'DBA'
  | 'BA'
  | 'SA'
  | 'QA';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  roles: DevRole[];
  icon: string;
  tags: string[];
  isPopular?: boolean;
  component: React.ComponentType;
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
}
