import { EdgeProps, SmoothStepEdge } from '@xyflow/react';

export default function ExecutionEdge(props: EdgeProps) {
  return (
    <SmoothStepEdge
      {...props}
      style={{ ...props.style, strokeWidth: 3 }}
      pathOptions={{
        offset: 24,
        borderRadius: 16,
      }}
      interactionWidth={20}
    />
  );
}

