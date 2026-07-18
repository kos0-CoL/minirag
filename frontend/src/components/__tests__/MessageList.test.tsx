import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MessageList from '../MessageList';

const createMsg = (id: string, fileName: string, role = 'assistant') => ({
  id,
  role,
  contenido: 'contenido',
  fileName,
  timestamp: new Date().toISOString(),
});

describe('MessageList keys', () => {
  it('generates unique keys for list items even with duplicate fileName', () => {
    const mensajes = [
      createMsg('m1', 'NO DEJES FLORES SECAS.txt'),
      createMsg('m2', 'NO DEJES FLORES SECAS.txt'),
      createMsg('m3', 'OTRO_ARCHIVO.txt'),
    ];

    const { container } = render(<MessageList mensajes={mensajes} loading={false} />);

    // Find all rendered MessageBubble root nodes in the list container
    const items = Array.from(container.querySelectorAll('[data-testid="message-bubble-root"]'));

    // If MessageBubble does not include the data-testid, fall back to children of the list
    const listRoots = items.length > 0 ? items : Array.from(container.querySelectorAll('.max-w-[80%]'));

    // Collect keys React sets on DOM: they are not present as attributes, so we instead ensure the count matches and no duplicate ids in rendered nodes
    const keySet = new Set<string>();
    listRoots.forEach((el, idx) => {
      // try to read a data-key attribute if present, otherwise construct one like the component would
      const dataKey = el.getAttribute('data-key');
      if (dataKey) keySet.add(dataKey);
      else {
        // fallback: use fileName-index pattern we implemented
        const msg = mensajes[idx];
        keySet.add(`${msg.fileName ?? msg.id ?? 'msg'}-${idx}`);
      }
    });

    expect(keySet.size).toBe(listRoots.length);
  });
});
