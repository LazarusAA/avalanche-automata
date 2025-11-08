import { EdgeProps, SmoothStepEdge } from '@xyflow/react';

export default function ExecutionEdge(props: EdgeProps) {
  return (
    <SmoothStepEdge
      {...props}
      style={{ ...props.style, strokeWidth: 2 }}
      pathOptions={{
        offset: 24,
        borderRadius: 16,
      }}
    />
  );
}

