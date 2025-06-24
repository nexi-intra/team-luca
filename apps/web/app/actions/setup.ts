'use server';

import { promises as fs } from 'fs';
import path from 'path';
import { isDevMode, requireDevMode } from '@monorepo/utils';
import { ENV_VARIABLES, type EnvCheckResult } from '@/lib/setup/types';

export async function checkEnvironment(): Promise<EnvCheckResult> {
  try {
    requireDevMode('Environment checking');

    const envFiles = ['.env.local', '.env.development.local', '.env'];
    let currentEnvFile: string | null = null;
    let envContent = '';

    // Find which env file exists
    for (const file of envFiles) {
      try {
        const filePath = path.join(process.cwd(), file);
        envContent = await fs.readFile(filePath, 'utf-8');
        currentEnvFile = file;
        break;
      } catch {
        // File doesn't exist, try next
      }
    }

    // Parse current environment variables
    const currentEnv: Record<string, string> = {};
    if (envContent) {
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            currentEnv[key] = value;
          }
        }
      });
    }

    // Check each variable
    const variables = ENV_VARIABLES.map(variable => {
      const currentValue = process.env[variable.key] || currentEnv[variable.key];
      let isValid = true;
      let error: string | undefined;

      if (variable.required && !currentValue) {
        isValid = false;
        error = 'Required variable is not set';
      } else if (currentValue && variable.validation && variable.validation.pattern) {
        const regex = new RegExp(variable.validation.pattern);
        if (!regex.test(currentValue)) {
          isValid = false;
          error = variable.validation.message;
        }
      }

      return {
        ...variable,
        currentValue: currentValue?.includes('secret') || currentValue?.includes('key') 
          ? currentValue.substring(0, 10) + '...' 
          : currentValue,
        isValid,
        error
      };
    });

    // Check if we can write to env files
    let canWrite = true;
    try {
      const testFilePath = path.join(process.cwd(), '.env.local');
      await fs.access(path.dirname(testFilePath), fs.constants.W_OK);
    } catch {
      canWrite = false;
    }

    return {
      isDevMode: isDevMode(),
      envFile: currentEnvFile,
      variables,
      canWrite
    };
  } catch (error) {
    console.error('Environment check failed:', error);
    throw new Error('Failed to check environment configuration');
  }
}

export async function updateEnvironmentVariable(
  key: string,
  value: string
): Promise<{ success: boolean; message: string }> {
  try {
    requireDevMode('Environment variable updates');

    // Validate the key
    const variable = ENV_VARIABLES.find(v => v.key === key);
    if (!variable) {
      return {
        success: false,
        message: `Unknown environment variable: ${key}`
      };
    }

    // Validate the value if validation rules exist
    if (variable.validation && variable.validation.pattern && value) {
      const regex = new RegExp(variable.validation.pattern);
      if (!regex.test(value)) {
        return {
          success: false,
          message: variable.validation.message || 'Invalid value format'
        };
      }
    }

    // Choose which env file to update (prefer .env.local)
    const envFile = '.env.local';
    const envPath = path.join(process.cwd(), envFile);

    // Read existing content
    let existingContent = '';
    try {
      existingContent = await fs.readFile(envPath, 'utf-8');
    } catch {
      // File doesn't exist, that's okay
    }

    // Parse existing variables
    const lines = existingContent.split('\n');
    const updatedLines: string[] = [];
    let variableUpdated = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(`${key}=`)) {
        // Update existing variable
        updatedLines.push(`${key}=${value}`);
        variableUpdated = true;
      } else {
        updatedLines.push(line);
      }
    }

    // If variable wasn't found, add it
    if (!variableUpdated) {
      if (updatedLines.length > 0 && updatedLines[updatedLines.length - 1] !== '') {
        updatedLines.push(''); // Add blank line
      }
      updatedLines.push(`${key}=${value}`);
    }

    // Write back to file
    await fs.writeFile(envPath, updatedLines.join('\n'), 'utf-8');

    return {
      success: true,
      message: `Successfully updated ${key} in ${envFile}`
    };
  } catch (error) {
    console.error('Failed to update environment variable:', error);
    return {
      success: false,
      message: 'Failed to update environment variable'
    };
  }
}

export async function generateEnvTemplateFile(): Promise<{ success: boolean; message: string; content?: string }> {
  try {
    requireDevMode('Template generation');

    const lines: string[] = [
      '# Magic Button Assistant Environment Configuration',
      '# Copy this file to .env.local and fill in your values',
      '',
      '# ===========================================',
      '# REQUIRED CONFIGURATION',
      '# ===========================================',
      ''
    ];

    // Group variables by category
    const categories = {
      auth: 'Authentication',
      general: 'General Application Settings',
      api: 'API Keys & External Services',
      telemetry: 'Telemetry & Monitoring'
    };

    Object.entries(categories).forEach(([category, title]) => {
      const categoryVars = ENV_VARIABLES.filter(v => v.category === category);
      
      if (categoryVars.length > 0) {
        lines.push(`# ${title}`);
        
        categoryVars.forEach(variable => {
          lines.push(`# ${variable.description}`);
          if (variable.example) {
            lines.push(`# Example: ${variable.example}`);
          }
          if (variable.required) {
            lines.push(`${variable.key}=`);
          } else {
            lines.push(`# ${variable.key}=`);
          }
          lines.push('');
        });
      }
    });

    const content = lines.join('\n');

    return {
      success: true,
      message: 'Environment template generated successfully',
      content
    };
  } catch (error) {
    console.error('Failed to generate template:', error);
    return {
      success: false,
      message: 'Failed to generate environment template'
    };
  }
}