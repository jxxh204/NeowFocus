import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "styled-components";
import theme from "../styles/theme";
import App from "../App";

const setup = () => {
  // const textHandler = jest.fn();
  // textHandler.mockReturnValue("면접 공부"); // 해당 텍스트를 무조건 리턴하도록 구현
  // expect(textHandler).toBeCalledWith("면접 공부"); // 검사.

  const utils = render(
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );

  return { ...utils };
};

describe("Task Input을 입력하기위해 클릭", () => {
  beforeEach(() => {
    setup();
  });
  test("배경색상 변경", async () => {
    const taskBackground = screen.getByTestId("background-color");
    const inputText = screen.getByPlaceholderText(
      "집중이 필요한 일 한가지를 적어주세요."
    );
    expect(taskBackground).toHaveStyle("filter:saturate(100%)");
    await userEvent.click(inputText);
    expect(taskBackground).toHaveStyle("filter:saturate(80%)");
  });

  test("text 입력 or 클릭 시 저장 버튼 생성", async () => {
    const inputText = screen.getByPlaceholderText(
      "집중이 필요한 일 한가지를 적어주세요."
    );

    await userEvent.click(inputText);
    const saveButton = screen.getByRole("button", { name: /포커스 모드 시작/ });

    expect(saveButton).toBeVisible();
    await userEvent.click(inputText); // 클릭 이벤트 제거하는 법 찾아야함
  });

  test("글자 수 표현, 50글자까지 구현", async () => {
    const inputText = screen.getByPlaceholderText(
      "집중이 필요한 일 한가지를 적어주세요."
    );

    await userEvent.click(inputText);

    const textLength = screen.getByTestId("text-length");

    userEvent.type(inputText, "인풋값 테스트");
    expect(textLength).toHaveTextContent("7/50");
    userEvent.clear(inputText);
    userEvent.type(
      inputText,
      "123456789012345678901234567890123456789012345678901"
    ); //51
    expect(textLength).toHaveTextContent("50/50");
    // expect(textLength).toHaveStyle("color:red");
  });

  test("focus가 작동하는 지 확인.", async () => {
    const inputText = screen.getByPlaceholderText(
      "집중이 필요한 일 한가지를 적어주세요."
    );
    await userEvent.hover(inputText);
    const editButton = screen.getByLabelText(/수정/);
    expect(editButton).toBeDefined();
    const deleteButton = screen.getByLabelText(/삭제/);
    expect(deleteButton).toBeDefined();
  });
});

// describe("Task Edit", () => {
//   test("포커스 모드에서만 호버가 가능해야 합니다.", async () => {
//     setup();

//     const inputText =
//       screen.getByPlaceholderText("지금 집중할 일을 적어주세요.");
//     const submitButton = screen.getByText("입력");

//     userEvent.type(inputText, "면접 공부");
//     expect(inputText).toHaveValue("면접 공부");

//     await userEvent.click(submitButton);

//     expect(inputText).toBeDisabled();

//     await userEvent.hover(inputText);
//     // 고치기
//     waitFor(() => {
//       const editButton = screen.getByLabelText(/수정/);
//       expect(editButton).toBeDefined();
//     });
//   });
// });

// describe("Task Delete", () => {
//   const 텍스트입력 = async () => {
//     const inputText =
//       screen.getByPlaceholderText("지금 집중할 일을 적어주세요.");
//     const submitButton = screen.getByText("입력");

//     userEvent.type(inputText, "면접 공부");
//     expect(inputText).toHaveValue("면접 공부");

//     await userEvent.click(submitButton);

//     expect(inputText).toBeDisabled();

//     return { textElement: inputText };

//     //
//   };
//   test("포커스 모드에서만 호버가 가능해야 합니다.", async () => {
//     setup();
//     const { textElement } = await 텍스트입력();
//     await userEvent.hover(textElement);

//     // 고치기
//     waitFor(() => {
//       const deleteButton = screen.getByRole("button", { name: /삭제/ });
//       expect(deleteButton).toBeDefined();
//     });
//   });
//   test("삭제 버튼을 누릅니다. 텍스트는 초기화되고 포커스모드는 false가 됩니다.", async () => {
//     setup();
//     const { textElement } = await 텍스트입력();
//     await userEvent.hover(textElement);

//     waitFor(async () => {
//       // 버튼 확인
//       const deleteButton = screen.getByRole("button", { name: /삭제/ });
//       await userEvent.click(deleteButton);
//       await expect(textElement).toHaveValue("");
//       await expect(textElement).toBeDisabled();
//       const submitButton = screen.getByText("입력");
//       expect(submitButton).toBeDefined();
//     });
//   });
//   test("Task Create", () => {});
// });
