import { Td, TdProps } from '@patternfly/react-table';
import { createUseStyles } from 'react-jss';
import { Color } from 'src/api/CustomerApi';

const useStyles = (color: any) => // TODO: Use the new Color type to fix this.
  createUseStyles({
    withColor: {
      color,
    },
  });

export interface TdPropsWithColor extends Omit<TdProps, 'ref'> {
  color: Color;
}

export const ColoredTd = ({ color, ...rest }: TdPropsWithColor) => {
  const classes = useStyles(color)();
  return <Td className={classes.withColor} {...rest} />;
};
