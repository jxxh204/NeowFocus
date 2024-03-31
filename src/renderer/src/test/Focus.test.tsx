import { render } from "@testing-library/react";
import { ThemeProvider } from "styled-components";

// const setup = () => {
//   // const textHandler = jest.fn();
//   // textHandler.mockReturnValue("면접 공부"); // 해당 텍스트를 무조건 리턴하도록 구현
//   // expect(textHandler).toBeCalledWith("면접 공부"); // 검사.

//   const utils = render();

//   return { ...utils };
// };

describe("포커스 모드 테스트", () => {
  test("수정 버튼 작동", () => {});
  test("삭제 버튼 작동", () => {});
  test("타이머 버튼", () => {});
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
