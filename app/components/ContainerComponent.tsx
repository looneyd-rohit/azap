import React from "react";
import styled from "styled-components";

const getColor = (props: any) => {
  if (props.isdragaccept) {
    return "#00e676";
  }
  if (props.isdragreject) {
    return "#ff1744";
  }
  if (props.isfocused) {
    return "#2196f3";
  }
  return "#eeeeee";
};

interface ContainerProps {
  isfocused: string;
  isdragaccept: string;
  isdragreject: string;
  selectedfilename: string | null;
}

const Container = styled.div<ContainerProps>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out,
    box-shadow 1s cubic-bezier(0.19, 1, 0.22, 1);
  box-shadow: ${(props) =>
    props.selectedfilename ? "0 0 100px rgba(33, 150, 243, 0.7)" : "none"};
`;

const ContainerComponent = (props: any) => {
  return (
    <Container
      {...props.getRootProps({
        isfocused: props.isfocused ? "true" : "false",
        isdragaccept: props.isdragaccept && props.isdisabled ? "true" : "false",
        isdragreject: props.isdragreject ? "true" : "false",
        selectedfilename: props.selectedfilename,
      })}
      className="w-full flex justify-center items-center"
    >
      <input {...props.getInputProps()} />
      {props.isdragactive ? (
        <p className="w-full flex justify-center items-center">
          {`Drag and drop a File here :)`}
        </p>
      ) : props.selectedfilename && props.selectedfilename.length > 0 ? (
        <p className="w-full flex justify-center items-center">
          Selected: {props.selectedfilename}
        </p>
      ) : (
        <p className="w-full flex justify-center items-center">
          {`Drag and drop a File here :)`}
        </p>
      )}
    </Container>
  );
};

export default ContainerComponent;
