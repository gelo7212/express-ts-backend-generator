import { Presentation } from '../../../src/domain/presentation/entities/presentation.entity';

describe('Presentation', () => {
  it('should create a presentation with valid properties', () => {
    const props = {
      name: 'Test Presentation',
      description: 'Test description',
      isActive: true
    };

    const presentation = new Presentation(props);

    expect(presentation.name).toBe(props.name);
    expect(presentation.description).toBe(props.description);
    expect(presentation.isActive).toBe(props.isActive);
    expect(presentation.id).toBeDefined();
  });

  it('should update presentation name', () => {
    const presentation = new Presentation({
      name: 'Original Name',
      isActive: true
    });

    presentation.updateName('Updated Name');

    expect(presentation.name).toBe('Updated Name');
  });
});