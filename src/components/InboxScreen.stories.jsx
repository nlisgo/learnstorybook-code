import InboxScreen from "./InboxScreen";
import store from "../lib/store";
import { rest } from "msw";
import { MockedState } from "./TaskList.stories";
import { Provider } from "react-redux";
import { within, userEvent, findByRole } from "@storybook/testing-library";
import { expect } from '@storybook/jest';

export default {
  component: InboxScreen,
  title: "InboxScreen",
  decorators: [(story) => <Provider store={store}>{story()}</Provider>],
  tags: ["autodocs"],
};

export const Default = {
  parameters: {
    msw: {
      handlers: [
        rest.get(
          "https://jsonplaceholder.typicode.com/todos?userId=1",
          (req, res, ctx) => {
            return res(ctx.json(MockedState.tasks));
          }
        ),
      ],
    },
  },
};
export const Error = {
  parameters: {
    msw: {
      handlers: [
        rest.get(
          "https://jsonplaceholder.typicode.com/todos?userId=1",
          (req, res, ctx) => {
            return res(ctx.status(403));
          }
        ),
      ],
    },
  },
};

export const PinTask = {
  parameters: {
    ...Default.parameters,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const getTask = (id) => canvas.findByRole('listitem', { name: id });

    const itemToPin = await getTask('task-4');
    // Find the pin button
    const pinButton = await findByRole(itemToPin, 'button', { name: 'pin' });
    // Click the pin button
    await userEvent.click(pinButton);
    // Check that the pin button is now a unpin button
    const unpinButton = within(itemToPin).getByRole('button', {
      name: 'unpin',
    });
    await expect(unpinButton).toBeInTheDocument();
  },
};

export const ArchiveTask = {
  parameters: {
    ...Default.parameters,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const getPin = (task) => within(task).queryByRole('button', { name: 'pin' });
    const getTask = (id) => canvas.findByRole('listitem', { name: id });

    const itemToArchive = await getTask('task-2');
    const archiveButton = await findByRole(itemToArchive, 'button', {
      name: 'archiveButton-2',
    });
    expect(getPin(itemToArchive)).not.toBeNull();
    await userEvent.click(archiveButton);

    // Check that the task is now archived
    // const archivedItem = await getTask('task-2');
    // expect(archivedItem).toHaveClass('TASK_ARCHIVED');

    // Check that the pin button is removed
    // expect(getPin(archivedItem)).toBeNull();
  },
};
