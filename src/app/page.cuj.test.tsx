import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './page';

const openTreeWithJson = async (user: ReturnType<typeof userEvent.setup>, json: object) => {
  render(<App />);
  const editor = screen.getByRole('textbox');
  await user.clear(editor);
  await user.click(editor);
  await user.paste(JSON.stringify(json));
  await user.click(screen.getByText('View'));
  await screen.findByLabelText(/json viewer tree/i);
  await user.click(screen.getByRole('button', { name: /expand/i }));
};

describe('CUJ regression coverage', () => {
  test('app loads and JSON tree renders from editor sample', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('jsonviewer.io')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByText('View'));

    expect(await screen.findByLabelText(/json viewer tree/i)).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  test('expand and collapse toolbar interactions work', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByText('View'));

    const tree = await screen.findByLabelText(/json viewer tree/i);

    await user.click(screen.getByRole('button', { name: /expand/i }));
    expect(await within(tree).findByText('web-app')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /collapse/i }));
    await waitFor(() => {
      expect(within(tree).queryByText('web-app')).not.toBeInTheDocument();
    });
  });

  test('unescape/undo path toggles nested JSON visibility', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /example/i }));
    await user.click(screen.getByText('View'));
    await user.click(screen.getByRole('button', { name: /expand/i }));

    expect(screen.queryByText('taglib-uri')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /unescape/i }));
    expect(await screen.findByText('taglib-uri')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /undo unescape/i }));
    await waitFor(() => {
      expect(screen.queryByText('taglib-uri')).not.toBeInTheDocument();
    });
  });

  test('deletes object key in view mode', async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    await openTreeWithJson(user, { keep: 1, remove: 2 });

    const removeRow = screen.getByText('remove').closest('.MuiTreeItem-label')!;
    await user.click(within(removeRow).getByTestId('DeleteOutlineIcon'));

    await waitFor(() => {
      expect(screen.queryByText('remove')).not.toBeInTheDocument();
    });
    expect(screen.getByText('keep')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test('deletes array item in view mode', async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    await openTreeWithJson(user, { items: ['a', 'b', 'c'] });

    const row = screen.getByText('1').closest('.MuiTreeItem-label')!;
    await user.click(within(row).getByTestId('DeleteOutlineIcon'));

    await waitFor(() => {
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  test('deletes nested key in view mode', async () => {
    const user = userEvent.setup();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    await openTreeWithJson(user, { outer: { inner: { removeMe: true, keepMe: false } } });

    const row = screen.getByText('removeMe').closest('.MuiTreeItem-label')!;
    await user.click(within(row).getByTestId('DeleteOutlineIcon'));

    await waitFor(() => {
      expect(screen.queryByText('removeMe')).not.toBeInTheDocument();
    });
    expect(screen.getByText('keepMe')).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  test('root cannot be deleted', async () => {
    const user = userEvent.setup();
    await openTreeWithJson(user, { a: 1 });

    const rootRow = screen.getByText('JSON').closest('.MuiTreeItem-label')!;
    expect(within(rootRow).queryByTestId('DeleteOutlineIcon')).not.toBeInTheDocument();
  });

  test('mobile/nav expanded panel visibility toggles', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('MoreHorizIcon'));
    expect(await screen.findByText('JSON Viewer')).toBeInTheDocument();

    await user.click(screen.getByTestId('CloseIcon'));
    await waitFor(() => {
      expect(screen.queryByText('JSON Viewer')).not.toBeInTheDocument();
    });
  });
});
