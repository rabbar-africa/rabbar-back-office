'use client';
import { Portal, Text, Tooltip, type TextProps } from '@chakra-ui/react';
import { useRef, useState, useEffect } from 'react';

interface TruncatedTextProps extends TextProps {
  children: string;
  lines?: number;
  showTooltip?: boolean;
}

export function TruncatedText({
  children,
  lines = 2,
  showTooltip = false,
  ...props
}: TruncatedTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    // Check if text is truncated by comparing scroll height with client height
    const checkTruncation = () => {
      setIsTruncated(element.scrollHeight > element.clientHeight);
    };

    checkTruncation();

    // Recheck on window resize
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [children]);

  const truncatedText = (
    <Text
      ref={textRef}
      css={{
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      {...props}
    >
      {children}
    </Text>
  );

  // Only show tooltip if text is actually truncated
  if (!showTooltip && !isTruncated) {
    return truncatedText;
  }

  return (
    <Tooltip.Root openDelay={250}>
      <Tooltip.Trigger asChild>{truncatedText}</Tooltip.Trigger>
      {/* Portalled so a scrolling table or card can't clip it. */}
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content
            p={'.75rem'}
            maxW="20rem"
            fontSize="12px"
            whiteSpace="normal"
            wordBreak="break-word"
          >
            {children}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
}
