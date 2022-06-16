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
  width
}) => {
  return (
    <div>
      <Button
        onClick={onClick}
        style={{
          backgroundColor: bgColor,
          padding: padding,
          borderRadius: borderRadius,
          width: width,
          color: color,
          fontFamily: "'Gilroy'",
          marginRight: marginRight,
          textTransform: "capitalize",
        }}
      >
        <Typography fontSize={"15px"} variant="body3">{text}</Typography>
      </Button>
    </div>
  );
};

export default CustomButton;
