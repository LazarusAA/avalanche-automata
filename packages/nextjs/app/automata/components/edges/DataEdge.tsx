import { EdgeProps, SmoothStepEdge } from '@xyflow/react';

export default function DataEdge(props: EdgeProps) {
  return (
    <SmoothStepEdge
      {...props}
      style={{ ...props.style, strokeDasharray: '3 3', strokeWidth: 2 }}
      pathOptions={{
        offset: 24,
        borderRadius: 16,
      }}
    />
  );
}

