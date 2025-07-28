import React from 'react';
import { Switch } from '@arco-design/web-react';
import { IconMoonFill, IconSunFill } from '@arco-design/web-react/icon';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <Switch
        checked={theme === 'dark'}
        onChange={toggleTheme}
        checkedIcon={<IconMoonFill />}
        uncheckedIcon={<IconSunFill />}
        size="small"
        style={{ marginLeft: 8 }}
      />
    </div>
  );
};

export default ThemeToggle;