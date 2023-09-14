import { Checkbox, FormControlLabel } from "@mui/material";
import React, { FC, useEffect, useState } from "react";

interface CheckBoxProps {
  id: string;
  visible: boolean;
}

const CheckBox: FC<CheckBoxProps> = ({ id, visible }) => {
  const [value, setValue] = useState(false);

  useEffect(() => {
    setValue(visible);
  }, [visible]);

  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  return <Checkbox {...label} value={value} onClick={() => setValue(!value)} />;
};

export default CheckBox;
