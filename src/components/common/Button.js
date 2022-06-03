import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const CustomButton = ({
  text,
  bgColor,
  borderRadius,
  padding,
  onClick,
  color,
  marginRight,
}) => {
  return (
    <div>
      <Button
        onClick={onClick}
        style={{
          backgroundColor: bgColor,
          padding: padding,
          borderRadius: borderRadius,
          color: color,
          fontFamily: "'Gilroy'",
          marginRight: marginRight,
          textTransform: "capitalize",
        }}
      >
        <Typography variant="body3">{text}</Typography>
      </Button>
    </div>
  );
};

export default CustomButton;
