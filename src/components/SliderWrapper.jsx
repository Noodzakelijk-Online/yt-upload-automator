import React from 'react';
import { Slider as OriginalSlider } from './ui/slider';

const SliderWrapper = React.forwardRef((props, ref) => {
  return <OriginalSlider {...props} ref={ref} />;
});

SliderWrapper.displayName = 'SliderWrapper';

export { SliderWrapper as Slider };