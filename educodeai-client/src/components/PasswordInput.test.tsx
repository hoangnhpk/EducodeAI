import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import PasswordInput from './PasswordInput';

function PasswordFields() {
  const [currentPassword, setCurrentPassword] = useState('secret-one');
  const [newPassword, setNewPassword] = useState('secret-two');

  return (
    <>
      <PasswordInput
        id="current-password"
        label="Mật khẩu hiện tại"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        autoComplete="current-password"
        error="Mật khẩu không đúng"
      />
      <PasswordInput
        id="new-password"
        label="Mật khẩu mới"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        autoComplete="new-password"
      />
    </>
  );
}

describe('PasswordInput', () => {
  it('is masked by default and exposes its label, error, and autocomplete metadata', () => {
    render(<PasswordFields />);

    const input = screen.getByLabelText('Mật khẩu hiện tại');
    const error = screen.getByRole('alert');

    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('autocomplete', 'current-password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(error).toHaveTextContent('Mật khẩu không đúng');
  });

  it('toggles only its own field and preserves values', () => {
    render(<PasswordFields />);

    const currentInput = screen.getByLabelText('Mật khẩu hiện tại');
    const newInput = screen.getByLabelText('Mật khẩu mới');
    const toggle = screen.getAllByRole('button', { name: 'Hiện mật khẩu' })[0];

    fireEvent.click(toggle);

    expect(currentInput).toHaveAttribute('type', 'text');
    expect(currentInput).toHaveValue('secret-one');
    expect(newInput).toHaveAttribute('type', 'password');
    expect(toggle).toHaveAttribute('aria-label', 'Ẩn mật khẩu');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    fireEvent.keyDown(toggle, { key: 'Enter' });
    fireEvent.click(toggle);
    expect(currentInput).toHaveAttribute('type', 'password');
    expect(currentInput).toHaveValue('secret-one');
  });
});
